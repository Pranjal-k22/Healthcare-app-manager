# PROJECT_MEMORY.md — Source of Truth

## Current Status
- **Active Phase**: Phase 1 — Foundation + Authentication
- **STATUS**: **COMPLETED**
- **Next Phase**: Phase 2 — Doctor Management + Working Hours & Specializations (Awaiting user command: "NOW PHASE 2")

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
- **Future AI (Phase 7/8)**: Local Ollama server (`http://localhost:11434`), structured prompt orchestration. *Not active in Phase 1.*
- **Future Calendar & Email (Phase 9/10)**: Google Calendar API (OAuth2) & Nodemailer (SMTP). *Not active in Phase 1.*

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
   - Public registration strictly assigns `PATIENT`. Admin is created via `seedAdmin.js`. Doctors are provisioned via Admin workflows.
4. **Security & Data Integrity**:
   - Passwords must always be hashed with bcrypt. Passwords and internal fields (`__v`) are stripped from JSON responses (`toJSON` transform).
   - JWT tokens contain `{ id, role }` and are validated by `authMiddleware.js`.
   - Access to protected endpoints is strictly checked using `requireRole(...roles)` in backend and `<ProtectedRoute>` in frontend.

---

## 4. Master Database Collections Plan
1. `users` — Base user identity (`PATIENT`, `DOCTOR`, `ADMIN`) [Implemented in Phase 1]
2. `doctorprofiles` — Specialization, experience, fees, working hours, leaves [Phase 2/5]
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
| **Phase 2** | Doctor Profile Management + Working Hours + Admin Doctor Provisioning | ⏳ **PENDING (Next)** |
| **Phase 3** | Slot Generation Engine + Double-Booking Prevention + Patient Booking Flow | ⏳ Planned |
| **Phase 4** | Symptom Intake + Doctor Clinical Consultation Notes + Prescriptions | ⏳ Planned |
| **Phase 5** | Local Ollama Integration + Health Probe + Prompt Isolation | ⏳ Planned |
| **Phase 6** | AI Pre-Visit & Post-Visit Summaries Engine | ⏳ Planned |
| **Phase 7** | Transactional Email Notifications (Nodemailer) | ⏳ Planned |
| **Phase 8** | Google Calendar Sync + OAuth2 Integration | ⏳ Planned |
| **Phase 9** | Background Cron Jobs (Reminders, Expired Slot Cleanup) | ⏳ Planned |
| **Phase 10** | End-to-End Integration, UI Polish, Dockerization | ⏳ Planned |

---

## 6. Phase 1 Implementation Status

### Completion Status: COMPLETED (Verified & Tested)

### Implemented Folders
- `client/` (Frontend React + TS + Vite SPA)
- `client/src/components/common/` (Navbar, ProtectedRoute)
- `client/src/context/` (AuthContext)
- `client/src/hooks/` (useAuth)
- `client/src/pages/auth/` (Login, Register)
- `client/src/pages/dashboard/` (PatientDashboard, DoctorDashboard, AdminDashboard)
- `client/src/services/` (apiClient, authApi)
- `client/src/types/` (auth)
- `client/src/utils/` (constants)
- `server/` (Backend Node.js & Express REST API)
- `server/config/` (db.js, env.js)
- `server/controllers/` (authController.js)
- `server/middleware/` (authMiddleware.js, roleMiddleware.js, errorMiddleware.js)
- `server/models/` (User.js)
- `server/routes/` (authRoutes.js)
- `server/utils/` (generateToken.js)
- `database/seed/` (seedAdmin.js)
- `docs/` (ARCHITECTURE.md)

### Implemented Files
- `server/server.js`, `server/app.js`, `server/package.json`
- `server/config/db.js`, `server/config/env.js`
- `server/models/User.js`
- `server/controllers/authController.js`
- `server/routes/authRoutes.js`
- `server/middleware/authMiddleware.js`, `server/middleware/roleMiddleware.js`, `server/middleware/errorMiddleware.js`
- `server/utils/generateToken.js`
- `database/seed/seedAdmin.js`
- `client/package.json`, `client/vite.config.ts`, `client/tsconfig.json`, `client/index.html`
- `client/src/main.tsx`, `client/src/App.tsx`, `client/src/index.css`
- `client/src/types/auth.ts`, `client/src/utils/constants.ts`
- `client/src/services/apiClient.ts`, `client/src/services/authApi.ts`
- `client/src/context/AuthContext.tsx`, `client/src/hooks/useAuth.ts`
- `client/src/components/common/Navbar.tsx`, `client/src/components/common/ProtectedRoute.tsx`
- `client/src/pages/auth/Login.tsx`, `client/src/pages/auth/Register.tsx`
- `client/src/pages/dashboard/PatientDashboard.tsx`, `client/src/pages/dashboard/DoctorDashboard.tsx`, `client/src/pages/dashboard/AdminDashboard.tsx`
- `.env`, `.env.example`, `.gitignore`, `README.md`, `docs/ARCHITECTURE.md`, `package.json`, `PROJECT_MEMORY.md`

### Installed Dependencies
- **Backend**: `express` (^4.19.2), `mongoose` (^8.5.2), `dotenv` (^16.4.5), `cors` (^2.8.5), `bcryptjs` (^2.4.3), `jsonwebtoken` (^9.0.2), `cookie-parser` (^1.4.6), `nodemon` (^3.1.4 dev).
- **Frontend**: `react` (^18.3.1), `react-dom` (^18.3.1), `react-router-dom` (^6.24.1), `axios` (^1.7.2), `lucide-react` (^0.408.0), `vite` (^5.3.3 dev), `typescript` (^5.5.3 dev).

### API Endpoints
- `GET /api/health` — Public server health probe.
- `POST /api/auth/register` — Public patient registration (Forces `PATIENT` role).
- `POST /api/auth/login` — Public login with credentials returning JWT + sanitized user.
- `GET /api/auth/me` — Protected profile endpoint requiring `Authorization: Bearer <token>`.

### User Model Details
- Schema fields: `name` (String, required), `email` (String, required, unique, lowercase, trimmed), `password` (String, required, min 6 chars, hashed via bcrypt), `role` (String, enum: `['PATIENT', 'DOCTOR', 'ADMIN']`, default: `'PATIENT'`), `timestamps` (createdAt, updatedAt).
- Methods & Hooks: Pre-save bcrypt hashing (salt rounds: 10), `comparePassword` instance method, `toJSON` transform automatically stripping `password` and `__v`.

### Authentication & JWT Implementation
- Token payload contains `{ id: user._id, role: user.role }`.
- Signed with `JWT_SECRET` and configurable expiry (`JWT_EXPIRES_IN=7d`).
- `authMiddleware.js` extracts Bearer header, validates JWT signature, queries user document excluding password, and sets `req.user`.

### Role-Based Authorization Implementation
- Reusable `requireRole('PATIENT' | 'DOCTOR' | 'ADMIN')` middleware returns `403 Forbidden` if `req.user.role` does not match.
- Public registration endpoint cannot create `ADMIN` or `DOCTOR` users.
- Database seeder `seedAdmin.js` creates the initial superuser account.

### Frontend Authentication & Protected Routes
- `AuthContext.tsx` manages `user`, `token`, `isAuthenticated`, `isLoading`, `login()`, `register()`, and `logout()`.
- Session hydration on app start queries `GET /api/auth/me` to validate stored token.
- `<ProtectedRoute allowedRoles={['...']}>` guards role-specific views and redirects unauthorized or unauthenticated visits.
- Role-based redirect logic: `PATIENT` ➔ `/patient/dashboard`, `DOCTOR` ➔ `/doctor/dashboard`, `ADMIN` ➔ `/admin/dashboard`.

### Testing Status
- [✓] Frontend TypeScript compilation & build (`npm run build`) passed with 0 errors.
- [✓] Backend module exports and JWT token generation verified with 0 errors.
- [✓] Bcrypt hashing and password comparison verified.
- [✓] RBAC role segregation and route guards verified.

### Known Limitations (Intentional for Phase 1)
- Doctor profiles and appointment booking are placeholders; will be introduced in Phase 2 & 3.
- Ollama, email notifications, Google Calendar, and background jobs are not yet active, maintaining strict vertical slice isolation.
