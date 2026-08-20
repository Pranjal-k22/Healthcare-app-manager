# PROJECT_MEMORY.md — Source of Truth

## Current Status
- **Phase 1 — Foundation + Authentication**: **COMPLETED**
- **Phase 2 — Doctor Management**: **COMPLETED**
- **Next Phase**: Phase 3 — Slot Generation Engine + Double-Booking Prevention + Patient Booking Flow (Awaiting user command: "NOW PHASE 3")

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
- **Future AI (Phase 7/8)**: Local Ollama server (`http://localhost:11434`), structured prompt orchestration. *Not active in Phase 2.*
- **Future Calendar & Email (Phase 9/10)**: Google Calendar API (OAuth2) & Nodemailer (SMTP). *Not active in Phase 2.*

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
3. `appointments` — Patient-Doctor slot bookings, statuses (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) [Phase 3/6]
4. `symptoms` — Patient-entered symptoms, duration, severity [Phase 3/6]
5. `aisummaries` — Pre-visit clinical overview & Post-visit consultation summaries [Phase 7/8]
6. `prescriptions` — Medications, dosage, frequency, follow-up instructions [Phase 8]
7. `notifications` — In-app alerts and notifications [Phase 9/11]
8. `calendarevents` — Google Calendar event metadata and synchronization [Phase 10]
9. `oauthtokens` — Stored OAuth credentials for Google Calendar integration [Phase 10]

---

## 5. Development Phases Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Foundation + JWT Authentication + RBAC + Seeder + Dark UI | ✅ **COMPLETED** |
| **Phase 2** | Doctor Profile Management + Working Hours + Admin Doctor Provisioning | ✅ **COMPLETED** |
| **Phase 3** | Slot Generation Engine + Double-Booking Prevention + Patient Booking Flow | ⏳ **PENDING (Next)** |
| **Phase 4** | Symptom Intake + Doctor Clinical Consultation Notes + Prescriptions | ⏳ Planned |
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

### Status: COMPLETED (Verified & Tested)

### DoctorProfile Model & User Relationship
- Model file: `server/models/DoctorProfile.js`.
- 1:1 relationship with `User` via `userId` (`type: ObjectId, ref: 'User', unique: true, required: true`).
- `specialization`: String, required, trimmed.
- `slotDuration`: Number (in minutes), required, default: 30, min: 5, max: 240.
- `workingHours`: Subschema for monday–sunday, each containing `{ enabled: Boolean, start: String (HH:mm), end: String (HH:mm) }`.
- `leaves`: Array of subdocuments `{ date: String (YYYY-MM-DD), reason: String }`.
- Unique index: `userId` (1:1 enforce).

### Doctor Validation & Service Layer
- Validator file: `server/validators/doctorValidator.js`:
  - 24-hour `HH:mm` format regex validation.
  - `start < end` chronological time validation.
  - `YYYY-MM-DD` real calendar date validation (leap year aware).
  - Weekly working hours validator across all 7 days.
  - Doctor creation, update, and leave input validators.
- Service file: `server/services/doctorService.js`:
  - `createDoctor(data)`: Hashes password, creates User (`role: 'DOCTOR'`), creates `DoctorProfile` with transaction support and compensating rollback.
  - `getAllDoctors({ specialization, search })`: Queries and populates doctors, case-insensitive keyword search and specialization filters.
  - `getDoctorById(id)`: Populates user info, returns sanitized doctor profile.
  - `getDoctorByUserId(userId)`: Resolves doctor profile for authenticated doctor user (`req.user._id`).
  - `updateDoctor(id, data)`: Admin update for doctor details, specialization, slot duration, and working hours.
  - `addDoctorLeave(id, { date, reason })`: Adds leave date with duplicate date prevention.
  - `removeDoctorLeave(id, date)`: Removes scheduled leave date.
  - `getDoctorLeaves(id)`: Returns doctor's leave array.

### API Endpoints
- `GET    /api/doctors` — Authenticated: List all doctors with `?search=` and `?specialization=` filters.
- `GET    /api/doctors/me` — Doctor only: View own doctor profile & schedule.
- `GET    /api/doctors/:id` — Authenticated: View doctor details & weekly hours.
- `POST   /api/doctors` — Admin only: Provision new doctor account and linked profile.
- `PUT    /api/doctors/:id` — Admin only: Update doctor credentials and schedule.
- `POST   /api/doctors/:id/leave` — Admin only: Schedule doctor leave date.
- `GET    /api/doctors/:id/leaves` — Authenticated: Get doctor's scheduled leaves.
- `DELETE /api/doctors/:id/leave/:date` — Admin only: Remove scheduled leave date.

### Frontend Components & Pages
- Types: `client/src/types/doctor.ts`.
- API Service: `client/src/services/doctorApi.ts`.
- Components: `DoctorCard.tsx`, `DoctorSearchBar.tsx`, `WorkingHoursForm.tsx`, `LeaveList.tsx`.
- Admin Pages: `ManageDoctors.tsx`, `CreateDoctor.tsx`, `EditDoctor.tsx`, `ManageDoctorLeave.tsx`.
- Patient Pages: `DoctorSearch.tsx`, `DoctorDetails.tsx`.
- Doctor Pages: `DoctorProfile.tsx`.
- Nav & Dashboards: Updated `Navbar.tsx` with contextual links, updated `PatientDashboard.tsx`, `DoctorDashboard.tsx`, and `AdminDashboard.tsx`.

### Seeder Script
- `database/seed/seedDoctors.js`: Seeds *Dr. Sarah Jenkins* (Cardiology) and *Dr. Marcus Vance* (Neurology). Run via `npm run seed:doctors`.

### Testing & Validation Results
- [✓] TypeScript build compilation (`npm run build` in `client/`) passed with 0 errors.
- [✓] Automated Phase 2 validation checks (`testDoctorPhase2.js`) passed with 0 errors.
- [✓] Time format, start < end, calendar date, working hours, and doctor creation payload validation verified.
- [✓] Phase 1 regression test passed: Auth endpoints, JWT verify, and RBAC guards fully intact.

### Known Limitations (Strictly by Design for Phase 2)
- Slot generation and appointment booking will be introduced in **Phase 3**.
- Ollama local LLM, clinical summaries, prescriptions, Google Calendar, and background jobs will follow in subsequent phases.
