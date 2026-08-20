# HealthPulse — Database Quick Reference

| Collection | Model File | Primary Key / Unique Indexes | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| `users` | `User.js` | `{ email: 1 }` (Unique) | None |
| `doctorprofiles` | `DoctorProfile.js` | `{ userId: 1 }` (Unique) | `userId` ➔ `User._id` |
| `appointments` | `Appointment.js` | `{ doctorId: 1, date: 1, startTime: 1 }` (Partial Unique, `status != 'CANCELLED'`) | `patientId`, `doctorId` ➔ `User._id` |
| `clinicalrecords` | `ClinicalRecord.js` | `{ appointmentId: 1 }` (Unique) | `appointmentId` ➔ `Appointment._id`, `patientId`, `doctorId` |
| `prescriptions` | `Prescription.js` | `{ clinicalRecordId: 1 }` (Unique) | `clinicalRecordId` ➔ `ClinicalRecord._id` |
| `doctorleaves` | `DoctorLeave.js` | `{ doctorId: 1, startDate: 1, endDate: 1 }` | `doctorId` ➔ `User._id` |
| `notifications` | `Notification.js` | `{ userId: 1, isRead: 1 }` | `userId` ➔ `User._id` |
| `calendarconnections` | `CalendarConnection.js`| `{ userId: 1 }` (Unique) | `userId` ➔ `User._id` |
| `medicationreminders` | `MedicationReminder.js`| `{ prescriptionId: 1, medicineName: 1, date: 1, timeSlot: 1 }` (Unique) | `prescriptionId` ➔ `Prescription._id`, `patientId` |
