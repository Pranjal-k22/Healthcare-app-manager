# Doctor Management Specification (Phase 2)

## 1. Overview & Data Model

Phase 2 provides full doctor management: practitioner profile provisioning, clinical specializations, qualifications, experience, consultation fees, clinic locations, professional biographies, contact details, working days, weekly working hours, slot durations, and availability status.

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
├── qualifications ([String]: 'MBBS', 'MD', 'FACC')
├── experienceYears (Number >= 0)
├── consultationFee (Number >= 0)
├── clinicName (String)
├── clinicAddress (String)
├── bio (String)
├── phone (String)
├── profileImage (String)
├── workingDays ([String]: 'Monday', 'Tuesday', ...)
├── slotDuration (Number: 15, 30, 45, 60 mins)
├── isAvailable (Boolean, default: true)
├── isActive (Boolean, default: true)
├── workingHours (Structured Object for Mon-Sun)
└── leaves (Array of { date: 'YYYY-MM-DD', reason: '...' })
```

---

## 2. User ↔ DoctorProfile Relationship

- The **`User`** model maintains core authentication credentials (name, email, hashed password, role: `DOCTOR`).
- The **`DoctorProfile`** model holds doctor-specific professional and availability metadata and links to `User._id` via `userId`.
- When creating a doctor, both the `User` and `DoctorProfile` documents are created atomically. In environments supporting replica sets, MongoDB sessions/transactions are used; in single-node standalone MongoDB environments, compensating rollback deletes the newly created `User` if profile creation fails.

---

## 3. Working Days & Working Hours Data Structure

Working hours are structured as a 7-day map with boolean enablement and strict 24-hour `HH:mm` time strings.

```json
{
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "workingHours": {
    "monday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "wednesday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "thursday": { "enabled": true, "start": "09:00", "end": "17:00" },
    "friday": { "enabled": true, "start": "09:00", "end": "15:00" },
    "saturday": { "enabled": false, "start": null, "end": null },
    "sunday": { "enabled": false, "start": null, "end": null }
  }
}
```

### Time Rules:
- **Format**: `HH:mm` (00:00 to 23:59).
- **Validation**: `start < end` is strictly enforced.
- **Disabled Days**: May contain `null` times.

---

## 4. Slot Duration & Availability Format

- **Slot Duration**: `Number` (integer minutes, e.g. 15, 20, 30, 45, 60; min: 5, max: 240).
- **isAvailable**: `Boolean` flag indicating if doctor is currently accepting bookings.
- **isActive**: `Boolean` soft-delete flag managed by administrators.

---

## 5. API Endpoints Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Private (All Authenticated) | List doctors with `?search=`, `?specialization=`, `?isAvailable=` filters |
| `GET` | `/api/doctors/me` | Private (`DOCTOR`) | Doctor inspects own profile & schedule |
| `PUT` | `/api/doctors/me` | Private (`DOCTOR`) | Doctor self-service update of qualifications, bio, fees, clinic, availability |
| `GET` | `/api/doctors/:id` | Private (All Authenticated) | Fetch single doctor details & public schedule |
| `POST` | `/api/doctors` | Private (`ADMIN`) | Provision new doctor user & profile |
| `PUT` | `/api/doctors/:id` | Private (`ADMIN`) | Full administrative update of doctor profile |
| `PATCH`| `/api/doctors/:id/status` | Private (`ADMIN`) | Toggle doctor active / deactivated status |
| `POST` | `/api/doctors/:id/leave` | Private (`ADMIN`) | Schedule a doctor leave date |
| `GET` | `/api/doctors/:id/leaves` | Private (All Authenticated) | Retrieve doctor leave entries |
| `DELETE`| `/api/doctors/:id/leave/:date`| Private (`ADMIN`) | Remove a scheduled leave date |

---

## 6. Role-Based Access Control Rules

1. **Patient**: Can discover doctors (`GET /api/doctors`) and view doctor profiles (`GET /api/doctors/:id`). Cannot create, edit, or deactivate doctors.
2. **Doctor**: Can view their own profile via `GET /api/doctors/me` and update permitted professional fields via `PUT /api/doctors/me`. Cannot modify another doctor's profile or escalate privileges.
3. **Admin**: Has full authority to provision doctors, update clinical details, toggle active status, and manage leave schedules.
