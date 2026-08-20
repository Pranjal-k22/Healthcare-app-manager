# Medication Reminders Specification (Phase 8)

## 1. Overview & Architecture

Phase 8 implements the **Medication Reminder and Adherence Tracking Engine** for HealthPulse. It transforms doctor-created structured prescriptions directly into time-accurate, scheduled dose reminders for patients with adherence tracking.

```text
               Doctor Consultation / Prescription Created
                                     │
                                     ▼
                    Structured Medication Records
              [{ name, dosage, frequency, duration, instructions }]
                                     │
                                     ▼
                      Medication Schedule Parser
                   [medicationScheduleService.js]
                                     │
                                     ▼
                      Discrete Medication Reminders
                     [MedicationReminder Collection]
                                     │
                                     ▼
                   Background Medication Reminder Worker
                        [medicationReminderJob.js]
                                     │
                                     ▼
                         In-App & Email Reminders
```

---

## 2. Structured Prescription as Authoritative Source of Truth

- **Zero Invention Rule**: The reminder engine never invents or estimates medications, doses, timings, or durations. All reminder schedules strictly originate from the doctor's structured prescription data stored in Phase 4.
- **No LLM in Scheduling**: The LLM is completely isolated from the medication scheduling and dosing engine.

---

## 3. Medication Reminder Data Model

```javascript
// server/models/MedicationReminder.js
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
  prescriptionId: {
    type: ObjectId,
    ref: 'Prescription',
    required: true,
    index: true
  },
  appointmentId: {
    type: ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    default: 'Take with water after meals'
  },
  scheduledDate: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  scheduledTime: {
    type: String, // HH:mm
    required: true,
    index: true
  },
  scheduledDateTime: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'TAKEN', 'MISSED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  takenAt: Date,
  notificationSentAt: Date,
  notificationId: { type: ObjectId, ref: 'Notification' },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Frequency Mapping & Scheduling Rules

| Frequency String | Scheduled Daily Times |
| :--- | :--- |
| **Once daily / OD** | `['08:00']` |
| **Once at bedtime / Night** | `['21:00']` |
| **Twice daily / BID / BD** | `['08:00', '20:00']` |
| **Three times daily / TID** | `['08:00', '14:00', '20:00']` |
| **Four times daily / QID** | `['08:00', '12:00', '16:00', '20:00']` |
| **Every 6 hours** | `['06:00', '12:00', '18:00', '00:00']` |
| **Explicit (e.g. `09:30, 21:30`)** | Extracted explicit HH:mm times directly |

---

## 5. Duplicate Prevention & Server Restart Resilience

1. **Compound Unique Idempotency Key**:
   `{ prescriptionId: 1, medicineName: 1, scheduledDate: 1, scheduledTime: 1 }` guarantees that duplicate reminder records can never be created for the same medicine in a prescription.
2. **Server Restart Immunity**: All future reminder slots are pre-persisted in MongoDB. The background worker queries `MedicationReminder` using `{ status: 'PENDING', scheduledDateTime: { $lte: new Date() } }`, ensuring zero reliance on fragile in-memory timers.
3. **Prescription Edits & Cancellations**: If a prescription is updated or cancelled, previous `PENDING` reminders are automatically marked `CANCELLED`.

---

## 6. API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medication-reminders/today` | Patient | Get today's scheduled medication doses |
| `GET` | `/api/medication-reminders/upcoming` | Patient | Get upcoming scheduled doses |
| `GET` | `/api/medication-reminders/history` | Patient | View complete reminder & adherence history |
| `PATCH` | `/api/medication-reminders/:id/taken` | Patient | Mark a dose as taken |
| `PATCH` | `/api/medication-reminders/:id/skip` | Patient | Mark a dose as skipped / missed |
| `GET` | `/api/prescriptions/:prescriptionId/reminders` | Private | Get all reminders for a prescription |

---

## 7. Frontend Integration

- **`MedicationReminderList` ([MedicationReminderList.tsx](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/client/src/components/patient/MedicationReminderList.tsx))**:
  - Integrated into the Patient Dashboard (`/patient/dashboard`).
  - Provides quick toggle between Today's Doses, Upcoming Doses, and Adherence History.
  - Interactive "Take Dose" and "Skip" action buttons.
