# Doctor Management Specification (Phase 2)

## 1. Overview & Data Model

Phase 2 introduces practitioner profiles, clinical specializations, weekly consultation hours, consultation slot durations, and leave management.

```text
User Collection (Authentication)
├── _id
├── name
├── email
├── password (bcrypt hashed)
└── role ('DOCTOR')
       │
       │ 1 : 1 (Linked by userId)
       ▼
DoctorProfile Collection (Clinical Details)
├── _id
├── userId (ObjectId -> User._id) [Unique]
├── specialization (String)
├── slotDuration (Number: 15, 30, 45, 60 mins)
├── workingHours (Structured Object for Mon-Sun)
└── leaves (Array of { date: 'YYYY-MM-DD', reason: '...' })
```

---

## 2. User ↔ DoctorProfile Relationship

- The **`User`** model maintains core authentication credentials (name, email, hashed password, role: `DOCTOR`).
- The **`DoctorProfile`** model holds doctor-specific metadata and links to `User._id` via the `userId` field.
- When creating a doctor, both the `User` and `DoctorProfile` documents are created atomically. In environments supporting replica sets, MongoDB sessions/transactions are used; in single-node standalone MongoDB environments, compensating rollback deletes the newly created `User` if profile creation fails.

---

## 3. Working Hours Data Structure

Working hours are structured as a 7-day map with boolean enablement and strict 24-hour `HH:mm` time strings.

```json
{
  "monday": { "enabled": true, "start": "09:00", "end": "17:00" },
  "tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
  "wednesday": { "enabled": true, "start": "09:00", "end": "17:00" },
  "thursday": { "enabled": true, "start": "09:00", "end": "17:00" },
  "friday": { "enabled": true, "start": "09:00", "end": "15:00" },
  "saturday": { "enabled": false, "start": null, "end": null },
  "sunday": { "enabled": false, "start": null, "end": null }
}
```

### Time Rules:
- **Format**: `HH:mm` (00:00 to 23:59).
- **Validation**: `start < end` is strictly enforced.
- **Disabled Days**: May contain `null` times.

---

## 4. Slot Duration Format

- **Type**: `Number` (stored in integer minutes).
- **Standard Supported Values**: `15`, `20`, `30`, `45`, `60`.
- **Validation**: Strict positive integer (`5 <= slotDuration <= 240`). Never stored as a string.

---

## 5. Doctor Leaves Data Structure

Leaves represent dates where a doctor is unavailable for consultations.

```json
[
  {
    "date": "2026-09-20",
    "reason": "Cardiology World Summit"
  }
]
```

- **Date Format**: `YYYY-MM-DD` (e.g. `2026-09-20`). Real calendar validity is enforced (invalid days like `2026-02-30` are rejected).
- **Duplicate Prevention**: Re-adding an existing leave date returns `409 Conflict`.

---

## 6. API Endpoints Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Private (All Authenticated) | List doctors with `?search=` and `?specialization=` filters |
| `GET` | `/api/doctors/me` | Private (`DOCTOR`) | Doctor inspects own profile & schedule |
| `GET` | `/api/doctors/:id` | Private (All Authenticated) | Fetch single doctor details & public schedule |
| `POST` | `/api/doctors` | Private (`ADMIN`) | Provision new doctor user & profile |
| `PUT` | `/api/doctors/:id` | Private (`ADMIN`) | Update doctor name, specialization, duration, hours |
| `POST` | `/api/doctors/:id/leave` | Private (`ADMIN`) | Schedule a doctor leave date |
| `GET` | `/api/doctors/:id/leaves` | Private (All Authenticated) | Retrieve doctor leave entries |
| `DELETE` | `/api/doctors/:id/leave/:date`| Private (`ADMIN`) | Remove a scheduled leave date |

---

## 7. Role-Based Access Control Rules

1. **Patient**: Can search doctors (`GET /api/doctors`) and view doctor profiles (`GET /api/doctors/:id`). Cannot create, edit, or delete doctors or leaves.
2. **Doctor**: Can view their own profile via `GET /api/doctors/me`. Cannot modify another doctor's profile.
3. **Admin**: Has full authority to provision doctors, update clinical details, and manage leave schedules.

---

## 8. Preparation for Phase 3 (Slot Generation)

In **Phase 3**, the slot generation algorithm will take:
1. `doctor.workingHours` for the requested day of week.
2. `doctor.slotDuration` (e.g., 30 mins) to generate discrete slot intervals.
3. `doctor.leaves` to mark full days as unavailable.
4. `appointments` collection to filter out already-booked or locked slots.
