# Doctor Clinical Workflow Specification (Phase 4)

## 1. Overview & Architecture

Phase 4 implements the authoritative **Doctor Clinical Workflow** for HealthPulse. When a patient attends an appointment, the attending doctor reviews the patient's chief complaints and background intake notes, records clinical observations and diagnostic findings, builds a structured medication prescription, and completes the consultation.

```text
                  Patient Attends Booked Appointment
                                │
                                ▼
         Doctor Opens Appointment in Consultation Room
             (/doctor/consultation/:appointmentId)
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
Patient Information & Intake                Doctor Enters Clinical Notes
(Chief complaints & notes)                  (Observations & Diagnosis)
          │                                           │
          └─────────────────────┬─────────────────────┘
                                │
                                ▼
             Doctor Builds Structured Prescription
           (Medication, Dosage, Frequency, Duration)
                                │
                                ▼
         Doctor Completes Visit (Status -> COMPLETED)
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
  ClinicalRecord                                Prescription
(Authoritative clinical notes)              (Structured Rx)
          │                                           │
          └─────────────────────┬─────────────────────┘
                                │
                                ▼
             Patient Views Post-Visit Summary & Rx
              (/patient/appointments/:id)
```

---

## 2. Clinical Data Models

### 2.1 ClinicalRecord Model
```javascript
// server/models/ClinicalRecord.js
{
  appointmentId: {
    type: ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
    index: true
  },
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
  clinicalNotes: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 5000
  },
  diagnosisNotes: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  patientInstructions: {
    type: String,
    trim: true,
    maxlength: 3000,
    default: ''
  },
  followUpDate: {
    type: String,       // 'YYYY-MM-DD'
    default: null
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Prescription Model
```javascript
// server/models/Prescription.js
{
  appointmentId: {
    type: ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
    index: true
  },
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
  medicines: [
    {
      name: { type: String, required: true, trim: true },
      dosage: { type: String, required: true, trim: true },
      frequency: { type: String, required: true, trim: true },
      duration: { type: String, required: true, trim: true },
      instructions: { type: String, trim: true, default: 'Take with water after meals' }
    }
  ],
  additionalInstructions: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Authoritative Clinical Data Policy

1. **Doctor Authority**: The doctor's entered clinical notes, diagnostic impressions, and structured prescriptions are authoritative medical records.
2. **Immutability by Patient**: Patients have read-only access to their verified clinical records and prescriptions. They cannot edit, alter dosage, or modify instructions.
3. **No Automated Fabrication**: All diagnostic notes and medication plans originate strictly from the practitioner.

---

## 4. API Endpoints Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments/:appointmentId/clinical-record` | Private (`DOCTOR`, `ADMIN`) | Save or update clinical notes |
| `GET` | `/api/appointments/:appointmentId/clinical-record` | Private (Owner/Doctor/Admin) | Retrieve clinical record for an appointment |
| `POST` | `/api/appointments/:appointmentId/prescription` | Private (`DOCTOR`, `ADMIN`) | Save or update structured prescription |
| `GET` | `/api/appointments/:appointmentId/prescription` | Private (Owner/Doctor/Admin) | Retrieve prescription for an appointment |
| `POST` | `/api/appointments/:appointmentId/complete-consultation` | Private (`DOCTOR`, `ADMIN`) | Finalize clinical notes & prescription, mark visit `COMPLETED` |
| `GET` | `/api/prescriptions/my` | Private (`PATIENT`) | Retrieve patient's personal prescriptions list |

---

## 5. Authorization & Data Privacy Matrix

| Action | Patient | Assigned Doctor | Other Doctor | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **View Patient Booking Notes** | ✅ | ✅ | ❌ | ✅ |
| **Save Clinical Notes** | ❌ | ✅ | ❌ | ✅ |
| **Create/Edit Prescription** | ❌ | ✅ | ❌ | ✅ |
| **Complete Visit** | ❌ | ✅ | ❌ | ✅ |
| **View Completed Record & Rx**| ✅ (Own) | ✅ (Assigned) | ❌ | ✅ |
| **Modify Post-Visit Rx** | ❌ | ✅ (Assigned) | ❌ | ❌ |

---

## 6. Status Transitions

```text
               BOOKED
                 │
                 │ (Doctor opens consultation & records notes)
                 ▼
             COMPLETED (Visit finalized, clinical record & Rx saved)
```
- Cancelled appointments (`CANCELLED`) cannot have clinical records or prescriptions attached.
