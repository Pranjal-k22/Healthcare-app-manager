# HealthPulse — Database Schema & Data Models

This document outlines all 10 MongoDB collections, their field definitions, relationships, indexes, ownership rules, and authorization boundaries.

---

## 1. Entity-Relationship Overview

```text
User (PATIENT / DOCTOR / ADMIN)
  ├── DoctorProfile (1:1 via userId)
  │     └── DoctorLeave (1:N via doctorId)
  │
  ├── Appointment (N:1 Patient, N:1 Doctor)
  │     ├── ClinicalRecord (1:1 via appointmentId)
  │     │     └── Prescription (1:1 via clinicalRecordId)
  │     │           └── MedicationReminder (1:N via prescriptionId)
  │     │
  │     └── GoogleCalendarEvent (1:1 mapped via googleCalendarEventId)
  │
  ├── Notification (1:N via userId)
  └── CalendarConnection (1:1 via userId)
```

---

## 2. Collection Schemas

### 1. `users` (`User.js`)
- **Purpose**: Stores authenticated user credentials and roles.
- **Fields**:
  - `name`: `String` (Required)
  - `email`: `String` (Required, unique, lowercase, trimmed)
  - `password`: `String` (Required, bcrypt hashed with 10 salt rounds)
  - `role`: `String` (Enum: `['PATIENT', 'DOCTOR', 'ADMIN']`, Default: `'PATIENT'`)
  - `phone`: `String` (Optional)
- **Indexes**: `{ email: 1 }` (Unique).
- **Ownership & Auth**: Patients own their profile; passwords stripped via `toJSON` transform.

### 2. `doctorprofiles` (`DoctorProfile.js`)
- **Purpose**: Professional profile, specialization, and schedule configuration.
- **Fields**:
  - `userId`: `ObjectId` ➔ `User` (Required, unique)
  - `specialization`: `String` (Required)
  - `experienceYears`: `Number` (Required, min: 0)
  - `consultationFee`: `Number` (Required, min: 0)
  - `slotDurationMinutes`: `Number` (Enum: `[15, 30, 45, 60]`, Default: `30`)
  - `workingHours`: `Array` of `{ dayOfWeek, isWorkingDay, startTime, endTime }`
  - `leaves`: `Array` of `{ date, reason }`
- **Indexes**: `{ userId: 1 }` (Unique).

### 3. `appointments` (`Appointment.js`)
- **Purpose**: Booking transactions between patients and doctors.
- **Fields**:
  - `patientId`: `ObjectId` ➔ `User` (Required)
  - `doctorId`: `ObjectId` ➔ `User` (Required)
  - `date`: `String` (Format: `YYYY-MM-DD`, Required)
  - `startTime`: `String` (Format: `HH:mm`, Required)
  - `endTime`: `String` (Format: `HH:mm`, Required)
  - `status`: `String` (Enum: `['BOOKED', 'COMPLETED', 'CANCELLED']`, Default: `'BOOKED'`)
  - `symptoms`: `String` (Required at booking intake)
  - `preVisitSummary`: `Object` (`{ urgency, chiefComplaint, suggestedQuestions, meta }`)
  - `aiStatus`: `String` (Enum: `['PENDING', 'READY', 'FAILED']`, Default: `'PENDING'`)
  - `googleCalendarEventId`: `String` (Optional)
  - `calendarSyncStatus`: `String` (Enum: `['SYNCED', 'FAILED', 'PENDING', 'NOT_CONNECTED']`)
  - `reminderSent`: `Boolean` (Default: `false`)
- **Compound Partial Unique Index**:
  `{ doctorId: 1, date: 1, startTime: 1 }` where `{ status: { $ne: 'CANCELLED' } }`.
  Guarantees atomic double-booking prevention.

### 4. `clinicalrecords` (`ClinicalRecord.js`)
- **Purpose**: Doctor's clinical findings and consultation documentation.
- **Fields**:
  - `appointmentId`: `ObjectId` ➔ `Appointment` (Required, unique)
  - `patientId`: `ObjectId` ➔ `User` (Required)
  - `doctorId`: `ObjectId` ➔ `User` (Required)
  - `clinicalNotes`: `String` (Required)
  - `diagnosis`: `String` (Optional)
  - `patientInstructions`: `String` (Optional)
  - `followUpDate`: `Date` (Optional)
  - `postVisitSummary`: `String` (Patient-friendly AI summary)
  - `aiStatus`: `String` (Enum: `['PENDING', 'READY', 'FAILED']`, Default: `'PENDING'`)
- **Indexes**: `{ appointmentId: 1 }` (Unique), `{ patientId: 1 }`, `{ doctorId: 1 }`.
- **Authority**: Strictly doctor-authoritative.

### 5. `prescriptions` (`Prescription.js`)
- **Purpose**: Structured medication orders created by the doctor.
- **Fields**:
  - `clinicalRecordId`: `ObjectId` ➔ `ClinicalRecord` (Required, unique)
  - `appointmentId`: `ObjectId` ➔ `Appointment` (Required)
  - `patientId`: `ObjectId` ➔ `User` (Required)
  - `doctorId`: `ObjectId` ➔ `User` (Required)
  - `medicines`: `Array` of:
    - `name`: `String` (Required)
    - `dosage`: `String` (Required, e.g. `500mg`)
    - `frequency`: `String` (Required, e.g. `Three times daily`)
    - `duration`: `String` (Required, e.g. `7 days`)
    - `instructions`: `String` (Optional)
- **Authority**: Doctor-authoritative source of truth for the Medication Reminder Engine.

### 6. `doctorleaves` (`DoctorLeave.js`)
- **Purpose**: Formal doctor date-range leave records with conflict management.
- **Fields**:
  - `doctorId`: `ObjectId` ➔ `User` (Required)
  - `startDate`: `String` (Format: `YYYY-MM-DD`, Required)
  - `endDate`: `String` (Format: `YYYY-MM-DD`, Required)
  - `reason`: `String` (Required)
  - `status`: `String` (Enum: `['APPROVED', 'PENDING', 'REJECTED', 'CANCELLED']`, Default: `'APPROVED'`)
- **Indexes**: `{ doctorId: 1, startDate: 1, endDate: 1 }`.

### 7. `notifications` (`Notification.js`)
- **Purpose**: In-app alerts and delivery audit records.
- **Fields**:
  - `userId`: `ObjectId` ➔ `User` (Required)
  - `title`: `String` (Required)
  - `message`: `String` (Required)
  - `type`: `String` (Enum: `['APPOINTMENT_BOOKED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_REMINDER', 'MEDICATION_REMINDER', 'LEAVE_CONFLICT', 'GENERAL']`)
  - `isRead`: `Boolean` (Default: `false`)
  - `relatedId`: `ObjectId` (Optional)
- **Indexes**: `{ userId: 1, isRead: 1 }`.

### 8. `calendarconnections` (`CalendarConnection.js`)
- **Purpose**: Stored Google OAuth credentials per user.
- **Fields**:
  - `userId`: `ObjectId` ➔ `User` (Required, unique)
  - `accessToken`: `String` (Encrypted / Redacted on output)
  - `refreshToken`: `String` (Encrypted / Redacted on output)
  - `expiryDate`: `Number`
  - `calendarId`: `String` (Default: `'primary'`)
  - `isConnected`: `Boolean` (Default: `true`)
- **Security**: Tokens stripped on all JSON serialization.

### 9. `medicationreminders` (`MedicationReminder.js`)
- **Purpose**: Discrete scheduled dose instances for patient adherence tracking.
- **Fields**:
  - `prescriptionId`: `ObjectId` ➔ `Prescription` (Required)
  - `patientId`: `ObjectId` ➔ `User` (Required)
  - `medicineName`: `String` (Required)
  - `dosage`: `String` (Required)
  - `date`: `String` (Format: `YYYY-MM-DD`, Required)
  - `timeSlot`: `String` (Format: `HH:mm`, Required)
  - `status`: `String` (Enum: `['PENDING', 'TAKEN', 'SKIPPED']`, Default: `'PENDING'`)
  - `reminderSent`: `Boolean` (Default: `false`)
- **Compound Idempotency Index**:
  `{ prescriptionId: 1, medicineName: 1, date: 1, timeSlot: 1 }` (Unique).
  Guarantees duplicate doses are never scheduled even on service restarts.
