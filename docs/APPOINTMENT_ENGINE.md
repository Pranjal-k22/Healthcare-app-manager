# Appointment Engine Specification (Phase 3)

## 1. Overview & Architecture

Phase 3 implements the complete **Appointment Engine** for HealthPulse, providing deterministic slot generation, database-level double-booking prevention, atomic rescheduling, patient notes, and role-guarded appointment lifecycle workflows for Patients, Doctors, and Admins.

```text
               Patient Selects Doctor & Date
                             │
                             ▼
     GET /api/appointments/slots/:doctorId/:date
        (or GET /api/doctors/:doctorId/slots)
                             │
                     [slotService.js]
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  DoctorProfile                           Appointments
(Working hours, Duration, Leaves)        (Active bookings)
         │                                       │
         └───────────────────┬───────────────────┘
                             │
                             ▼
                    Discrete Slots Array
                             │
                             ▼
               Patient Selects Slot & Books
                             │
                             ▼
                 POST /api/appointments
                             │
                 [appointmentService.js]
                             │
                 MongoDB Partial Unique Index
             { doctorId: 1, date: 1, startTime: 1 }
               [status IN ('BOOKED', 'COMPLETED')]
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       Index Satisfied            Duplicate Violation
         201 Created                 409 Conflict
```

---

## 2. Appointment Data Model

```javascript
// server/models/Appointment.js
{
  patientId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,       // 'YYYY-MM-DD'
    required: true,
    index: true
  },
  startTime: {
    type: String,       // 'HH:mm' (24-hour)
    required: true
  },
  endTime: {
    type: String,       // 'HH:mm' (24-hour, calculated server-side)
    required: true
  },
  status: {
    type: String,
    enum: ['BOOKED', 'COMPLETED', 'CANCELLED'],
    default: 'BOOKED',
    index: true
  },
  reason: {
    type: String,       // Reason for visit / chief complaint
    maxlength: 500,
    default: ''
  },
  patientNotes: {
    type: String,       // Additional patient background notes
    maxlength: 1000,
    default: ''
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Database Indexes & Double-Booking Protection

### The Compound Partial Unique Index

```javascript
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['BOOKED', 'COMPLETED'] }
    },
    name: 'unique_active_doctor_slot'
  }
);
```

### Why this index exists:
1. **Race-Condition Safety**: If two patients submit booking requests for the same doctor, date, and start time concurrently, MongoDB will allow only the first write to succeed. The second write immediately throws error `11000`, which `appointmentService.js` catches and transforms into an HTTP `409 Conflict`.
2. **Reusability of Cancelled Slots**: A standard unique index on `(doctorId, date, startTime)` would permanently block the slot even if the appointment was cancelled. By applying a **partialFilterExpression** (`status IN ['BOOKED', 'COMPLETED']`), when an appointment is set to `CANCELLED`, MongoDB omits it from the unique index, permitting the slot to be rebooked seamlessly.

### Query Optimization Indexes
- `{ patientId: 1, date: 1, status: 1 }` (Speeds up patient appointment tab queries)
- `{ doctorId: 1, date: 1, status: 1 }` (Speeds up doctor daily schedule lookups)

---

## 4. Slot Generation Algorithm

The slot generation engine ([slotService.js](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/server/services/slotService.js)) generates bookable intervals dynamically:

1. **Profile Resolution**: Finds doctor profile by `doctorId`. Verifies `isAvailable !== false` and `isActive !== false`.
2. **Past Date Check**: Rejects any `date < today`.
3. **Leave Check**: If `profile.leaves` contains `date`, returns `[]` (doctor is unavailable all day).
4. **Weekday Schedule Check**: Resolves weekday (e.g. `monday`). If `workingHours[weekday].enabled === false`, returns `[]`.
5. **Interval Slicing**:
   - Converts `start` time (e.g. `09:00`) and `end` time (e.g. `17:00`) to minutes from midnight.
   - Slices time in increments of `profile.slotDuration` (e.g. 30 mins).
   - Bounds strictly: `slotStart + duration <= workEnd`. (Last slot in `09:00 - 17:00` is `16:30 - 17:00`).
6. **Collision & Past Slot Detection**:
   - Queries MongoDB for active appointments on that date (`status IN ['BOOKED', 'COMPLETED']`).
   - If slot is today and `slotStart <= currentTime`, marks `available: false`.
   - Uses interval overlap detection: `existing.start < requested.end && existing.end > requested.start`.
   - If interval overlaps with any active booking, marks `available: false`.
   - Otherwise, marks `available: true`.

---

## 5. Appointment State Machine & Lifecycle

```text
             [ Patient Books ]
                     │
                     ▼
                  BOOKED
                     │
         ┌───────────┴───────────┐
         │                       │
 [ Patient / Doctor /     [ Doctor / Admin
    Admin Cancels ]          Completes ]
         │                       │
         ▼                       ▼
     CANCELLED               COMPLETED
```

### Transition Rules:
- `BOOKED` ➔ `CANCELLED`: Permitted before appointment start time.
- `BOOKED` ➔ `COMPLETED`: Permitted only for assigned Doctor or Admin.
- `CANCELLED` ➔ `*`: Terminal state. Cannot be completed, rescheduled, or cancelled again.
- `COMPLETED` ➔ `*`: Terminal state. Preserves clinical history.

---

## 6. Atomic Rescheduling Flow

Rescheduling guarantees that an existing appointment is never lost if the new requested slot fails or conflicts:

1. **Step 1**: Patient chooses new date and start time.
2. **Step 2**: Backend checks if the requested slot is the exact same slot. If so, returns the existing appointment without creating duplicate.
3. **Step 3**: Backend validates the new slot against doctor's working hours, duration, leaves, and past-time rules.
4. **Step 4**: Backend attempts to insert the **new appointment** first (`status: 'BOOKED'`).
5. **Step 5**: If new booking fails (e.g. 409 slot conflict), execution halts; the old appointment remains intact in `BOOKED` state.
6. **Step 6**: Only after the new appointment is successfully created in MongoDB, the old appointment is updated to `status: 'CANCELLED'`.

---

## 7. Timezone Strategy

1. **Date Representation**: Strict standard ISO calendar date string `YYYY-MM-DD` (e.g. `2026-09-15`).
2. **Time Representation**: Strict standard 24-hour military format `HH:mm` (e.g. `09:30`, `16:45`).
3. **Time Comparison**: All time calculations convert `HH:mm` into integer minutes from midnight (`hours * 60 + minutes`) for deterministic math.
4. **Server Boundary**: The server application timezone operates consistently across slot generation, past-time checks, and database validation.

---

## 8. API Endpoint Reference

| HTTP Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments/slots/:doctorId/:date` | Private (All Roles) | Generate dynamic slot list with availability flags |
| `GET` | `/api/doctors/:doctorId/slots?date=YYYY-MM-DD` | Private (All Roles) | Alias endpoint for dynamic slot generation |
| `POST` | `/api/appointments` | Private (`PATIENT`) | Book a consultation slot |
| `GET` | `/api/appointments/my` | Private (`PATIENT`) | Retrieve patient's personal appointments |
| `GET` | `/api/appointments/doctor` | Private (`DOCTOR`) | Retrieve doctor's consultation queue |
| `GET` | `/api/appointments/admin/all` | Private (`ADMIN`) | Admin list of all clinic appointments |
| `GET` | `/api/appointments/:id` | Private (Owner/Doctor/Admin) | Fetch single appointment details |
| `PATCH` | `/api/appointments/:id/cancel` | Private (Owner/Doctor/Admin) | Cancel a booked appointment |
| `PATCH` | `/api/appointments/:id/reschedule` | Private (Patient Owner/Admin) | Atomically reschedule to a new slot |
| `PATCH` | `/api/appointments/:id/complete` | Private (`DOCTOR`, `ADMIN`) | Mark consultation as completed |

---

## 9. Authorization Table

| Action | Patient | Doctor | Admin | Ownership Check |
| :--- | :---: | :---: | :---: | :--- |
| **Get Available Slots** | ✅ | ✅ | ✅ | Open to all authenticated users |
| **Book Appointment** | ✅ | ❌ | ❌ | Binds authenticated user as `patientId` |
| **View My Appointments** | ✅ | ❌ | ❌ | Returns only records where `patientId === req.user._id` |
| **View Doctor Queue** | ❌ | ✅ | ❌ | Returns only records where `doctorId === req.user._id` |
| **View Single Appointment**| ✅ | ✅ | ✅ | Must be patient owner, assigned doctor, or admin |
| **Cancel Appointment** | ✅ (Own) | ✅ (Assigned) | ✅ | Cannot cancel completed or past appointments |
| **Reschedule Appointment** | ✅ (Own) | ❌ | ✅ | Atomically cancels old and creates new |
| **Complete Appointment** | ❌ | ✅ (Assigned) | ✅ | Transitions `BOOKED` ➔ `COMPLETED` |
