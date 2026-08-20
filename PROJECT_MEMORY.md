# PROJECT_MEMORY.md — Source of Truth

## Current Status
- **Phase 1 — Foundation + Authentication**: **COMPLETED**
- **Phase 2 — Doctor Management**: **COMPLETED**
- **Phase 3 — Appointment Engine**: **COMPLETED**
- **Phase 4 — Doctor Clinical Workflow**: **COMPLETED**
- **Phase 5 — Notifications + Background Jobs**: **COMPLETED**
- **Phase 6 — Google Calendar Integration**: **COMPLETED**
- **Phase 7 — Leave Conflict + Reliability**: **COMPLETED**
- **Phase 8 — Medication Reminders**: **COMPLETED**
- **Phase 9 — Testing + Security**: **COMPLETED**
- **Next Phase**: Phase 10 — FINAL LOCAL LLM IMPLEMENTATION (Awaiting user command: "PHASE 10")

---

## 1. Project Overview & Objective
- **Project Name**: HealthPulse (Healthcare Appointment & Follow-up Manager)
- **Primary Goal**: A full-stack MERN healthcare system facilitating role-based workflows for Patients, Doctors, and Administrators with doctor schedule slot booking, local Ollama LLM clinical synthesis (pre-visit & post-visit), Nodemailer transactional emails, Google Calendar synchronization, doctor leave conflict prevention, medication adherence reminders, and end-to-end security hardening.

---

## 2. Technology Stack
- **Frontend**: React 18, Vite, TypeScript, React Router v6, Axios, Lucide React, Vanilla CSS design tokens (Dark/Glassmorphism theme).
- **Backend**: Node.js, Express.js (REST API architecture), cookie-parser, cors, helmet, express-rate-limit, dotenv, nodemailer, googleapis.
- **Database**: MongoDB with Mongoose ODM.
- **Security & Auth**: JSON Web Tokens (JWT), Bcryptjs (10 salt rounds), Role-Based Access Control (RBAC), Helmet HTTP headers, Rate Limiting.
- **Future AI (Phase 10)**: Local Ollama server (`http://localhost:11434`), structured prompt orchestration. *Not active in Phase 9.*

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
3. `appointments` — Patient-Doctor slot bookings, statuses (`BOOKED`, `COMPLETED`, `CANCELLED`), `googleCalendarEventId`, `calendarSyncStatus` [Implemented in Phase 3 & 6]
4. `clinicalrecords` — Doctor clinical notes, examination findings, diagnostic impressions, patient instructions [Implemented in Phase 4]
5. `prescriptions` — Structured medications list, dosage, frequency, duration, instructions [Implemented in Phase 4]
6. `notifications` — In-app alerts and notifications [Implemented in Phase 5]
7. `calendarconnections` — Stored OAuth credentials and sync status for Google Calendar [Implemented in Phase 6]
8. `doctorleaves` — Doctor date range leaves, reasons, and approval statuses [Implemented in Phase 7]
9. `medicationreminders` — Structured dose schedules and adherence states [Implemented in Phase 8]
10. `aisummaries` — Pre-visit clinical overview & Post-visit consultation summaries [Phase 10]

---

## 5. Development Phases Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Foundation + JWT Authentication + RBAC + Seeder + Dark UI | ✅ **COMPLETED** |
| **Phase 2** | Doctor Profile Management + Working Hours + Admin Doctor Provisioning | ✅ **COMPLETED** |
| **Phase 3** | Slot Generation Engine + Double-Booking Prevention + Patient Booking Flow | ✅ **COMPLETED** |
| **Phase 4** | Doctor Clinical Workflow + Clinical Notes + Structured Prescriptions | ✅ **COMPLETED** |
| **Phase 5** | Notifications + Background Jobs (Nodemailer, Queue/Cron Scheduler) | ✅ **COMPLETED** |
| **Phase 6** | Google Calendar Integration + OAuth2 Flow | ✅ **COMPLETED** |
| **Phase 7** | Leave Conflict + Reliability | ✅ **COMPLETED** |
| **Phase 8** | Medication Reminders | ✅ **COMPLETED** |
| **Phase 9** | Testing + Security Hardening | ✅ **COMPLETED** |
| **Phase 10** | FINAL LOCAL LLM IMPLEMENTATION (Ollama / Qwen / Llama) | ⏳ **PENDING (Next)** |
| **Phase 11** | Documentation + Deployment | ⏳ Planned |

---

## 6. Phase 1 Implementation Status (COMPLETED)
- Express REST API with CORS whitelist, JSON body parser, and centralized error handling.
- MongoDB connection using Mongoose ODM.
- User schema with email uniqueness, bcrypt password hashing, and role enum (`PATIENT`, `DOCTOR`, `ADMIN`).
- JWT authentication issuing tokens in HTTP response and Bearer token parsing middleware.
- RBAC middleware (`requireRole`).
- Admin seeder script (`seedAdmin.js`) with idempotency.
- React 18 + Vite + TypeScript frontend with auth context, protected routes, and glassmorphism styling.

---

## 7. Phase 2 Implementation Status (COMPLETED)
- `DoctorProfile` model linked to `User` via unique `userId`.
- Weekly working hours configuration (Monday–Sunday with `HH:mm` format and `start < end` validation).
- Leave management system (`leaves` array with `YYYY-MM-DD` and reasons).
- REST API endpoints for doctor CRUD, search, and admin leave provisioning.
- Frontend components, doctor directory, and seeder script (`seedDoctors.js`).

---

## 8. Phase 3 Implementation Status (COMPLETED)
- `Appointment` model with `patientId`, `doctorId`, `date`, `startTime`, `endTime`, `status`, `reason`, `patientNotes`.
- Compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` for active bookings (`status IN ['BOOKED', 'COMPLETED']`).
- Deterministic slot generation algorithm (`slotService.js`) filtering working hours, slot durations, leaves, and live collisions.
- Atomic rescheduling with rollback protection and duplicate slot prevention.
- Endpoints: `/api/appointments`, `/api/appointments/slots/:doctorId/:date`, `/api/appointments/my`, `/api/appointments/doctor`, `/api/appointments/admin/all`, `/api/appointments/:id/cancel`, `/api/appointments/:id/reschedule`, `/api/appointments/:id/complete`.

---

## 9. Phase 4 Implementation Status (COMPLETED)
- `ClinicalRecord` model with `clinicalNotes` (required), `diagnosisNotes`, `patientInstructions`, `followUpDate`.
- `Prescription` model with structured `medicines` array (`name`, `dosage`, `frequency`, `duration`, `instructions`).
- Clinical examination consultation room (`/doctor/consultation/:appointmentId`).
- Patient post-visit consultation and prescription summary page (`/patient/appointments/:id`).
- Endpoints: `POST /api/appointments/:appointmentId/clinical-record`, `GET /api/appointments/:appointmentId/clinical-record`, `POST /api/appointments/:appointmentId/prescription`, `GET /api/appointments/:appointmentId/prescription`, `POST /api/appointments/:appointmentId/complete-consultation`, `GET /api/prescriptions/my`.

---

## 10. Phase 5 Implementation Status (COMPLETED)
- `Notification` model with read status, appointment reference, and types enum.
- In-app notification bell in Navbar with real-time unread badge, dropdown, and full `/notifications` directory.
- `nodemailer` transactional email service with retry backoff and mock fallback.
- Background reminder job (`reminderJob.js`) for upcoming consultations.

---

## 11. Phase 6 Implementation Status (COMPLETED)
- `CalendarConnection` model with OAuth tokens stripped from API serialization.
- `googleCalendarService.js` with OAuth consent screen generation, token refresh listener, and non-blocking event sync.
- `calendarJob.js` background queue with exponential retry backoff.
- `CalendarSettingsCard.tsx` in Doctor Profile and Patient Appointments.

---

## 12. Phase 7 Implementation Status (COMPLETED)
- `DoctorLeave` model tracking date ranges (`startDate` to `endDate`), reasons, and statuses.
- Appointment conflict detection rejecting leave requests on booked dates with `409 Conflict`.
- Authoritative backend booking validation in `slotService.js` and `appointmentService.js`.
- `DoctorLeaveManager.tsx` UI with real-time conflict pre-checking.

---

## 13. Phase 8 Implementation Status (COMPLETED)
- `MedicationReminder` model with compound unique idempotency index.
- Deterministic schedule generator converting frequencies & durations into daily time slots.
- Background medication reminder worker dispatching in-app alerts and emails.
- `MedicationReminderList.tsx` adherence UI with dose tracking actions.

---

## 14. Phase 9 Implementation Status (COMPLETED)

### Status: COMPLETED (Verified & Tested)

### Test Architecture & Master Suite
- Master Test Runner: `server/tests/runAllTests.js` (`npm test` in `server/`).
- 9 Dedicated Test Suites:
  - `auth.test.js`: Hashing, JWT tampering, JSON password stripping, mass-assignment escalation guard.
  - `appointment.test.js`: Slot calculations, double-booking partial unique index, past dates, IDOR checks.
  - `clinical.test.js`: Note schemas, structured prescriptions, doctor authority vs patient read-only.
  - `leave.test.js`: Date range validator, overlapping leave checks, 409 conflict detection.
  - `notification.test.js`: Lifecycle types enum, email template renderers, user isolation.
  - `calendar.test.js`: Token redaction in JSON, OAuth CSRF state, sync statuses.
  - `medication.test.js`: Frequency & duration parsers, unique compound idempotency index.
  - `security.test.js`: Stack trace stripping, CastError sanitization, helmet headers & rate limiter.
  - `e2e.test.js`: End-to-end full clinic workflow simulation.

### Security Hardening Measures
- **Helmet HTTP Headers**: Enforced in `server/app.js` against XSS, sniffing, clickjacking.
- **Rate Limiting**: `express-rate-limit` installed on `/api/auth` (100 reqs / 15m) to prevent brute-force attacks.
- **Payload Size Limits**: Enforced `1mb` JSON limit on `express.json()`.
- **Error Sanitization**: Production error responses never leak stack traces or internal schema paths.
- **IDOR Protection**: Authoritative backend ownership checks on all resource mutations.

### Testing & Validation Results
- [✓] Automated test suite (`npm test`) passed **9/9 suites cleanly in 0.53s**.
- [✓] Client TypeScript build compilation (`npm run build`) passed with **0 errors in 4.62s**.
- [✓] Zero critical vulnerabilities identified.
- [✓] Regressions on Phase 1–8 passed cleanly.

### Known Limitations (Strictly by Design for Phase 9)
- Local Ollama LLM integration belongs strictly to **Phase 10**.
