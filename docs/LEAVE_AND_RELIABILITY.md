# Doctor Leave & Conflict Reliability Specification (Phase 7)

## 1. Overview & Architecture

Phase 7 establishes the **Leave Management and Conflict Prevention Engine** for HealthPulse. It guarantees that doctors cannot be booked during scheduled off-duty periods and prevents leave requests from invalidating existing patient consultations.

```text
               Doctor Leave Application (startDate, endDate)
                                     │
                                     ▼
                      1. Date & Overlap Validation
                                     │
                                     ▼
                2. Conflicting Bookings Pre-check
             [Appointment.find({ doctorId, date, BOOKED })]
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
       Conflicts Found                               No Conflicts Found
             │                                               │
             ▼                                               ▼
    409 Conflict Error                              Persist DoctorLeave
  (Returns conflict list;                           (status: APPROVED)
 Patient visits preserved)                                   │
                                                             ▼
                                                Slots Dynamically Blocked
                                                 [slotService.js + DB]
```

---

## 2. Doctor Leave Data Model

```javascript
// server/models/DoctorLeave.js
{
  doctorId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  endDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'APPROVED',
    index: true
  },
  rejectionReason: String,
  approvedBy: { type: ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedBy: { type: ObjectId, ref: 'User' },
  rejectedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Conflict Prevention & Protection Rules

1. **Patient Appointment Preservation**: If active `BOOKED` appointments exist in the requested leave date range, the leave application is rejected with a `409 Conflict` status code and a list of conflicting appointment summaries (`date`, `startTime`, `endTime`, `patientName`). Patient bookings are **never** silently cancelled or modified.
2. **Double-Booking & Slot Race Condition Prevention**:
   - `slotService.js` actively checks `isDoctorOnLeave(doctorUserId, dateStr)` and returns empty slots `[]` for any dates within approved leave ranges.
   - `appointmentService.js` enforces an authoritative server-side check during `bookAppointment`. If a booking request arrives for a leave date, it is rejected with a `400 Bad Request` error.
   - Database-level compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` guarantees atomic double-booking protection.

---

## 4. API Endpoints

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/doctor/leaves` | Doctor | Apply for leave period (conflict checked) |
| `GET` | `/api/doctor/leaves` | Doctor | Get authenticated doctor's leave records |
| `GET` | `/api/doctor/leaves/conflicts` | Doctor | Pre-check for conflicting bookings |
| `PATCH` | `/api/doctor/leaves/:id/cancel` | Doctor / Admin | Cancel scheduled leave |
| `GET` | `/api/admin/leaves` | Admin | View clinic-wide doctor leaves |

---

## 5. Frontend Integration

- **`DoctorLeaveManager` ([DoctorLeaveManager.tsx](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/client/src/components/doctor/DoctorLeaveManager.tsx))**:
  - Embedded into Doctor Profile (`/doctor/profile`).
  - Pre-checks date ranges in real time and displays conflicting bookings before submission.
  - Allows doctors to review past and upcoming leaves and cancel scheduled off-duty periods.
