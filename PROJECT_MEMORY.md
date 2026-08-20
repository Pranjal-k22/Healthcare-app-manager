# PROJECT_MEMORY.md — Source of Truth

## Current Status
- **Phase 1 — Foundation + Authentication**: **COMPLETED**
- **Phase 2 — Doctor Management**: **COMPLETED**
- **Phase 3 — Appointment Engine**: **COMPLETED**
- **Next Phase**: Phase 4 — Symptom Intake + Doctor Clinical Consultation Notes + Prescriptions (Awaiting user command: "NOW PHASE 4")

---

## 1. Project Overview & Objective
- **Project Name**: HealthPulse (Healthcare Appointment & Follow-up Manager)
- **Primary Goal**: A full-stack MERN healthcare system facilitating role-based workflows for Patients, Doctors, and Administrators with doctor schedule slot booking, local Ollama LLM clinical synthesis (pre-visit & post-visit), Nodemailer transactional emails, and Google Calendar synchronization.

---

## 2. Technology Stack
- **Frontend**: React 18, Vite, TypeScript, React Router v6, Axios, Lucide React, Vanilla CSS design tokens (Dark/Glassmorphism theme).
- **Backend**: Node.js, Express.js (REST API architecture), cookie-parser, cors, dotenv.
- **Database**: MongoDB with Mongoose ODM.
- **Security & Auth**: JSON Web Tokens (JWT), Bcryptjs (10 salt rounds), Role-Based Access Control (RBAC).
- **Future AI (Phase 5/6)**: Local Ollama server (`http://localhost:11434`), structured prompt orchestration. *Not active in Phase 3.*
- **Future Calendar & Email (Phase 7/8)**: Google Calendar API (OAuth2) & Nodemailer (SMTP). *Not active in Phase 3.*

---

## 3. Core Architectural Principles & Non-Negotiable Constraints
1. **Vertical Slice Development**: Implement only the requested phase. Do NOT jump ahead or introduce premature complexity.
2. **Strict Layer Separation**:
   - `Route` ➔ `Controller` ➔ `Service` ➔ `Model` ➔ `MongoDB`
   - Business logic belongs in services/controllers, never inside raw route definitions.
   - LLM communication is isolated inside `server/services/llm/` (`ollamaService.js`, `preVisitService.js`, `postVisitService.js`, `prompts.js`).
   - React must NEVER communicate directly with Ollama.
3. **Role-Based Access Control (RBAC)**:
   - Three distinct roles: `PATIENT`, `DOCTOR`, `ADMIN`.
   - Public registration strictly assigns `PATIENT`. Admin is created via `seedAdmin.js`. Doctors are provisioned via Admin workflows (`seedDoctors.js` or `POST /api/doctors`).
4. **Security & Data Integrity**:
   - Passwords must always be hashed with bcrypt. Passwords and internal fields (`__v`) are stripped from JSON responses (`toJSON` transform).
   - JWT tokens contain `{ id, role }` and are validated by `authMiddleware.js`.
   - Access to protected endpoints is strictly checked using `requireRole(...roles)` in backend and `<ProtectedRoute>` in frontend.

---

## 4. Master Database Collections Plan
1. `users` — Base user identity (`PATIENT`, `DOCTOR`, `ADMIN`) [Implemented in Phase 1]
2. `doctorprofiles` — Specialization, experience, fees, working hours, leaves [Implemented in Phase 2]
3. `appointments` — Patient-Doctor slot bookings, statuses (`BOOKED`, `COMPLETED`, `CANCELLED`) [Implemented in Phase 3]
4. `symptoms` — Patient-entered symptoms, duration, severity [Phase 4]
5. `aisummaries` — Pre-visit clinical overview & Post-visit consultation summaries [Phase 6]
6. `prescriptions` — Medications, dosage, frequency, follow-up instructions [Phase 4]
7. `notifications` — In-app alerts and notifications [Phase 7/9]
8. `calendarevents` — Google Calendar event metadata and synchronization [Phase 8]
9. `oauthtokens` — Stored OAuth credentials for Google Calendar integration [Phase 8]

---

## 5. Development Phases Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Foundation + JWT Authentication + RBAC + Seeder + Dark UI | ✅ **COMPLETED** |
| **Phase 2** | Doctor Profile Management + Working Hours + Admin Doctor Provisioning | ✅ **COMPLETED** |
| **Phase 3** | Slot Generation Engine + Double-Booking Prevention + Patient Booking Flow | ✅ **COMPLETED** |
| **Phase 4** | Symptom Intake + Doctor Clinical Consultation Notes + Prescriptions | ⏳ **PENDING (Next)** |
| **Phase 5** | Local Ollama Integration + Health Probe + Prompt Isolation | ⏳ Planned |
| **Phase 6** | AI Pre-Visit & Post-Visit Summaries Engine | ⏳ Planned |
| **Phase 7** | Transactional Email Notifications (Nodemailer) | ⏳ Planned |
| **Phase 8** | Google Calendar Sync + OAuth2 Integration | ⏳ Planned |
| **Phase 9** | Background Cron Jobs (Reminders, Expired Slot Cleanup) | ⏳ Planned |
| **Phase 10** | End-to-End Integration, UI Polish, Dockerization | ⏳ Planned |

---

## 6. Phase 1 Implementation Status (COMPLETED)
- Express REST API with CORS whitelist, JSON body parser, and centralized error handling.
- `User` model with pre-save bcrypt hashing, `comparePassword`, unique email index, and role enum (`PATIENT`, `DOCTOR`, `ADMIN`).
- JWT authentication (`generateToken.js`, `authMiddleware.js`, `roleMiddleware.js`).
- Database seeders: `seedAdmin.js`.
- React + Vite + TypeScript frontend with `AuthContext.tsx`, `useAuth.ts`, `ProtectedRoute.tsx`, `Navbar.tsx`, `Login.tsx`, `Register.tsx`, and role dashboard placeholders.

---

## 7. Phase 2 Implementation Status (COMPLETED)
- Model file: `server/models/DoctorProfile.js` (1:1 with `User` via `userId`).
- Validator file: `server/validators/doctorValidator.js` (24-hour `HH:mm` format, `start < end`, `YYYY-MM-DD` calendar validation).
- Service file: `server/services/doctorService.js` (CRUD, leaves management, transactions with compensating rollback).
- Endpoints: `GET /api/doctors`, `GET /api/doctors/me`, `GET /api/doctors/:id`, `POST /api/doctors`, `PUT /api/doctors/:id`, `POST /api/doctors/:id/leave`, `DELETE /api/doctors/:id/leave/:date`.
- Frontend: `DoctorCard.tsx`, `DoctorSearchBar.tsx`, `WorkingHoursForm.tsx`, `LeaveList.tsx`, `ManageDoctors.tsx`, `CreateDoctor.tsx`, `EditDoctor.tsx`, `ManageDoctorLeave.tsx`, `DoctorSearch.tsx`, `DoctorDetails.tsx`, `DoctorProfile.tsx`.

---

## 8. Phase 3 Implementation Status (COMPLETED)

### Status: COMPLETED (Verified & Tested)

### Appointment Model & Double-Booking Protection
- Model file: `server/models/Appointment.js`.
- Fields: `patientId` (ref: `User`), `doctorId` (ref: `User`), `date` (`YYYY-MM-DD`), `startTime` (`HH:mm`), `endTime` (`HH:mm`), `status` (`'BOOKED' | 'COMPLETED' | 'CANCELLED'`), `reason` (String placeholder).
- **Compound Partial Unique Index**: `{ doctorId: 1, date: 1, startTime: 1 }` with `{ partialFilterExpression: { status: { $in: ['BOOKED', 'COMPLETED'] } } }`.
- Guarantees database-level race condition protection against simultaneous bookings.
- When an appointment is set to `CANCELLED`, MongoDB omits it from the unique index, making the slot available for rebooking.
- Query Indexes: `{ patientId: 1, date: 1, status: 1 }`, `{ doctorId: 1, date: 1, status: 1 }`.

### Slot Generation & Validation Layer
- Validator file: `server/validators/appointmentValidator.js`:
  - Validates `doctorId`, `date` (`YYYY-MM-DD`, not in past), `startTime` (`HH:mm`), and reason.
  - Standardized timezone math in integer minutes from midnight.
- Service file: `server/services/slotService.js`:
  - `generateAvailableSlots(doctorId, date)`: Resolves working hours and slot duration, bounds intervals strictly within `[start, end]`, detects leaves, filters past same-day times, checks existing active bookings, and returns `{ startTime, endTime, available }`.

### Appointment Service Layer
- Service file: `server/services/appointmentService.js`:
  - `bookAppointment(payload)`: Validates doctor availability, working hours, and leaves; calculates server-side `endTime`; attempts MongoDB insert; translates duplicate key error (code 11000) into clean `409 Conflict`.
  - `getPatientAppointments(patientId, status)`: Retrieves patient's appointments.
  - `getDoctorAppointments(doctorUserId, status, date)`: Retrieves doctor's appointments.
  - `getAppointmentById(id, requestingUser)`: Ownership-verified fetch (patient owner, assigned doctor, or admin).
  - `cancelAppointment(id, requestingUser)`: Validates ownership, ensures appointment is `BOOKED` and not in past, and sets `status = 'CANCELLED'`.
  - `rescheduleAppointment(id, newSlot, requestingUser)`: Validates new slot, creates new appointment first, then marks old appointment `CANCELLED`.
  - `completeAppointment(id, requestingUser)`: Transitions `BOOKED` ➔ `COMPLETED` for assigned doctor or admin.
  - `getAllAppointmentsAdmin(filters)`: Administrative query for clinic-wide appointments.

### API Endpoints
- `GET   /api/appointments/slots/:doctorId/:date` — Private: Generate slots with availability flags.
- `POST  /api/appointments` — Private (Patient): Book a consultation.
- `GET   /api/appointments/my` — Private (Patient): List own appointments.
- `GET   /api/appointments/doctor` — Private (Doctor): List doctor consultation queue.
- `GET   /api/appointments/admin/all` — Private (Admin): Master appointments view.
- `GET   /api/appointments/:id` — Private: Ownership-checked appointment details.
- `PATCH /api/appointments/:id/cancel` — Private: Cancel appointment.
- `PATCH /api/appointments/:id/reschedule` — Private: Atomic reschedule.
- `PATCH /api/appointments/:id/complete` — Private (Doctor/Admin): Mark visit completed.

### Frontend Components & Pages
- Types: `client/src/types/appointment.ts`.
- API Service: `client/src/services/appointmentApi.ts`.
- Components: `SlotPicker.tsx`, `AppointmentStatusBadge.tsx`, `AppointmentCard.tsx`, `CancelAppointmentModal.tsx`, `RescheduleModal.tsx`.
- Pages: `BookAppointment.tsx`, `MyAppointments.tsx`, `DoctorAppointments.tsx`, `ManageAppointments.tsx`.
- Navigation: Updated `Navbar.tsx` and activated "Book Appointment" in `DoctorDetails.tsx`.

### Testing & Validation Results
- [✓] TypeScript build compilation (`npm run build` in `client/`) passed with 0 errors.
- [✓] Automated Phase 3 validation checks (`testAppointmentPhase3.js`) passed with 0 errors.
- [✓] Slot generation bounded within working hours, past-time checks, and leaves verified.
- [✓] Double-booking partial unique index and error 11000 translation verified.
- [✓] Atomic rescheduling verified.
- [✓] Phase 1 & Phase 2 regression tests passed: Auth, RBAC, Doctor profiles, and leaves remain 100% operational.

### Known Limitations (Strictly by Design for Phase 3)
- Symptoms intake, doctor clinical notes, and structured prescriptions will be introduced in **Phase 4**.
- Ollama local LLM, clinical summaries, Nodemailer, and Google Calendar will follow in subsequent phases.
