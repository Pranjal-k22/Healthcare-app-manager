# Comprehensive Project Blueprint & Feature Audit: HealthPulse

**Document:** `detail.md`  
**Project:** HealthPulse — Healthcare Appointment & Follow-up Manager  
**Version:** Phase 9 Complete / Pre-Phase 10  
**Stack:** React 18, TypeScript, Vite, Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer, Google Calendar API  

---

## 1. Executive Summary & Architecture Overview

HealthPulse is an enterprise-grade full-stack healthcare appointment, clinical workflow, and follow-up management platform. It facilitates segregated, secure workflows for **Patients**, **Doctors**, and **Administrators**.

### System Architecture Flow
```text
  React 18 + TS + Vite (Client: Port 5173)
                   │
                   ▼  (Axios with JWT Bearer Interceptors & CORS Whitelist)
      Express.js REST API (Server: Port 5000)
                   │
      ┌────────────┼───────────────────────────┐
      ▼            ▼                           ▼
  Auth & RBAC   Business Layer              Security & Background
  • JWT verify  • Doctor Management         • Helmet Security Headers
  • RBAC rules  • Dynamic Slot Engine       • Rate Limiting (/api/auth)
  • Bcrypt hash • Clinical Records          • 60s Reminder Cron Job
                • Prescriptions             • 60s Medication Cron Job
                • Leave Conflict Engine     • Google Sync Queue
                • Medication Reminders
                   │
                   ▼
      MongoDB Atlas / Local (Mongoose ODM)
```

---

## 2. What IS Implemented in Detail (Phases 1 — 9)

### ✅ Phase 1: Foundation & Authentication
- **User Identity Model**: `User.js` with `email` uniqueness, `password` (hashed with bcrypt 10 salt rounds), `role` (`PATIENT`, `DOCTOR`, `ADMIN`).
- **Password & Token Security**: Passwords and internal fields (`__v`) are stripped from JSON serialization (`toJSON`).
- **Stateless JWT Auth**: Signed tokens with configurable expiration (`JWT_EXPIRES_IN`), verified via `authMiddleware.js`.
- **Role-Based Access Control (RBAC)**: `requireRole(...roles)` middleware enforcing endpoint access boundaries.
- **Admin Seeder**: Idempotent administrative account initialization (`npm run seed:admin`).
- **UI Design System**: Glassmorphism dark theme with design tokens (`index.css`), responsive layouts, and `AuthContext`.

### ✅ Phase 2: Doctor Management & Scheduling
- **Doctor Profile Model**: `DoctorProfile.js` linked 1:1 with `User` via unique `userId`.
- **Structured Working Hours**: Monday–Sunday schedules with `HH:mm` format and `start < end` validation.
- **Configurable Slot Durations**: 15, 20, 30, 45, and 60-minute consultation slots.
- **Doctor Directory & Search**: Real-time filtering by name, specialization, and keyword.
- **Doctor Seeder**: Sample multi-specialty doctor provisioning (`npm run seed:doctors`).

### ✅ Phase 3: Dynamic Appointment Engine
- **Appointment Model**: `Appointment.js` linking `patientId`, `doctorId`, `date`, `startTime`, `endTime`, and status (`BOOKED`, `COMPLETED`, `CANCELLED`).
- **Deterministic Slot Calculation**: Dynamically generates available consultation slots based on working hours, slot lengths, existing bookings, and approved doctor leaves.
- **Double-Booking Prevention**: Database-level compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` for active bookings (`status IN ['BOOKED', 'COMPLETED']`).
- **Atomic Rescheduling**: Safe transition ensuring the original appointment remains active if the requested new slot fails.
- **Patient Booking UI & Doctor Schedule Queue**: Interactive slot picker and doctor consultation management terminal.

### ✅ Phase 4: Doctor Clinical Workflow & Prescriptions
- **Clinical Records**: `ClinicalRecord.js` storing doctor clinical notes, diagnostic impressions, patient instructions, and follow-up recommendations.
- **Structured Prescriptions**: `Prescription.js` storing medications with `name`, `dosage`, `frequency`, `duration`, and `instructions`.
- **Clinical Examination Terminal**: Secure doctor consultation room (`/doctor/consultation/:appointmentId`) for live note-taking and visit completion.
- **Patient Post-Visit Summaries**: Read-only patient post-consultation view (`/patient/appointments/:id`).

### ✅ Phase 5: Notifications & Background Scheduler
- **Notification Model**: `Notification.js` with unread tracking, appointment references, and notification types.
- **Lifecycle Event Dispatchers**: In-app and email notifications for booking, cancellation, rescheduling, and prescription readiness.
- **Background Cron Scheduler**: Periodic worker (`reminderJob.js`) evaluating upcoming appointments (default 60-minute window) with duplicate prevention.
- **Resilient Email Service**: Nodemailer integration with exponential backoff retries (up to 3 attempts) and mock development fallback.
- **In-App Notification Center**: Notification bell in Navbar with unread badge and dedicated `/notifications` management screen.

### ✅ Phase 6: Google Calendar Integration
- **Google OAuth 2.0 Flow**: User consent screen flow with CSRF state parameter protection and token refresh listener.
- **Calendar Connection Model**: `CalendarConnection.js` with access and refresh tokens stripped from client API serialization.
- **Non-Blocking Calendar Synchronization**: Background event queue (`calendarJob.js`) handling sync, update on reschedule, and deletion on cancellation.
- **Medical Privacy**: Strict omission of clinical notes, diagnoses, and prescriptions from Google Calendar payloads.

### ✅ Phase 7: Doctor Leave & Conflict Reliability
- **Doctor Leave Model**: `DoctorLeave.js` tracking date ranges (`startDate` to `endDate`), reasons, and statuses (`APPROVED`, `PENDING`, `REJECTED`, `CANCELLED`).
- **Appointment Conflict Prevention**: Automatic query of active appointments in requested leave ranges; returns `409 Conflict` and prevents silent cancellation of patient consultations.
- **Authoritative Backend Slot Blocking**: `slotService.js` and `appointmentService.js` exclude and reject bookings during approved leave periods.
- **Doctor Leave UI**: Embedded leave scheduler with live conflict pre-checking in Doctor Profile (`/doctor/profile`).

### ✅ Phase 8: Medication Reminders & Adherence Tracking
- **Medication Reminder Model**: `MedicationReminder.js` storing discrete daily dose schedules.
- **Deterministic Frequency & Duration Parser**: Parses `Once daily`, `Twice daily`, `Three times daily`, `Every 6 hours`, and explicit `HH:mm` times into discrete slots.
- **Unique Idempotency Key**: Compound unique index `{ prescriptionId: 1, medicineName: 1, scheduledDate: 1, scheduledTime: 1 }` preventing duplicate dose slots.
- **Background Medication Worker**: `medicationReminderJob.js` scans due doses every 60s and dispatches in-app alerts and reminder emails.
- **Patient Adherence UI**: Interactive dose timeline on Patient Dashboard (`/patient/dashboard`) with "Take Dose" and "Skip" action buttons.

### ✅ Phase 9: Testing & Security Hardening
- **Master Test Runner**: `npm test` running 9 comprehensive automated test suites in under 1 second.
- **Security Middleware**:
  - `helmet`: HTTP headers defending against XSS, clickjacking, and sniffing.
  - `express-rate-limit`: Rate limiting on `/api/auth` (100 requests per 15 minutes).
  - `1mb` JSON body payload size limit preventing memory exhaustion attacks.
- **Error Sanitization**: Production error responses completely strip stack traces and internal paths.
### ✅ Phase 10: Local LLM Integration (Pre & Post-Visit Summaries)
- **Local Ollama Integration**: Provider-agnostic orchestration (`llmService.js`) interfacing with a local Ollama daemon (`http://localhost:11434`) running lightweight open models (`llama3` / `mistral`).
- **Verbatim Spec Prompts**: Exact prompt templates (`prompts.js`) ensuring standardized clinical intake synthesis and patient discharge guidance.
- **Pre-Visit Clinical Intake Synthesis**: Evaluates patient-submitted symptoms at booking confirmation; returns structured urgency levels (`Low`, `Medium`, `High`), chief complaints, and 3 suggested doctor exploratory questions (`preVisitSummary`).
- **Post-Visit Patient Guidance & Medication Safety**: Converts physician notes and prescription items into patient-friendly summaries (`postVisitSummary`).
- **Strict Zero-Hallucination Medication Validation**: `validator.js` enforces that 100% of prescribed medicine names exist in the generated post-visit summary before persisting to the database; omissions trigger validation failure.
- **Non-Blocking Resilient Failure Tolerance**: Decoupled async generation with bounded 2-attempt retries and exponential backoff; Ollama timeouts or failures gracefully set `aiStatus: 'FAILED'` without blocking booking or visit completion.
- **Dedicated Role-Segregated UI Views**: Pre-visit summaries render strictly in the Doctor Consultation Room (`/doctor/consultation/:appointmentId`); post-visit guidance renders strictly in the Patient Consultation Record (`/patient/appointments/:id`).

---

## 3. What IS NOT Mentioned / NOT Yet Implemented (Out-of-Scope)

### ⏳ Planned for Upcoming Phases
1. **Phase 11: Production Deployment & Documentation (NEXT PHASE)**
   - *Not yet implemented.*
   - Docker containerization / Docker Compose.
   - Production CI/CD pipelines and cloud deployment guides.

### ❌ Explicitly Out-of-Scope / Excluded from Project Specification
1. **Payment Gateways & Billing Systems**:
   - No Stripe, PayPal, Razorpay, or insurance claim processing. Consultation fees are informational attributes in `DoctorProfile`.
2. **Telemedicine / Live Video & Audio Calling**:
   - No WebRTC, Agora, Twilio, or video chat servers. The system manages in-person / clinic appointment logistics.
3. **Electronic Health Records (EHR) HL7 / FHIR Standards**:
   - No hospital enterprise HL7/FHIR integration. Data is self-contained in MongoDB.
4. **Third-Party SMS Gateways**:
   - Notifications are handled via in-app alerts and Nodemailer transactional emails (no Twilio SMS).
5. **Multi-Tenant Hospital Chain Architecture**:
   - Designed for single clinic / multi-doctor healthcare center operations, not multi-tenant SaaS chains.
6. **Direct Patient-to-Doctor Chat / Messaging**:
   - No real-time chat rooms; communication is structured via appointments, intake notes, prescriptions, and alerts.
7. **Cloud LLM Providers**:
   - Strictly local Ollama integration for patient privacy; no external OpenAI/Anthropic API calls.

---

## 4. Feature & Implementation Matrix

| Domain | Feature | Status | Details |
| :--- | :--- | :--- | :--- |
| **Auth** | User Registration & Login | ✅ Implemented | JWT + Bcrypt (10 salt rounds) |
| **Auth** | RBAC Authorization | ✅ Implemented | `PATIENT`, `DOCTOR`, `ADMIN` |
| **Doctors** | Weekly Schedules & Slot Durations | ✅ Implemented | Monday–Sunday, 15–60 min slots |
| **Doctors** | Doctor Search & Directory | ✅ Implemented | Name, specialization, keywords |
| **Appointments** | Dynamic Slot Engine | ✅ Implemented | Respects hours, durations, leaves |
| **Appointments** | Double-Booking Prevention | ✅ Implemented | DB compound partial unique index |
| **Appointments** | Atomic Rescheduling | ✅ Implemented | Rollback protection |
| **Clinical** | Clinical Notes & Diagnoses | ✅ Implemented | Doctor consultation room |
| **Clinical** | Structured Prescriptions | ✅ Implemented | Medicines array with dosage & instructions |
| **Notifications** | In-App Alerts & Email | ✅ Implemented | Nodemailer + Notification bell |
| **Notifications** | Background Reminder Cron | ✅ Implemented | 60-minute window check |
| **Calendar** | Google Calendar OAuth 2.0 | ✅ Implemented | Non-blocking sync queue |
| **Leave** | Leave Conflict Engine | ✅ Implemented | 409 Conflict rejection, protects bookings |
| **Medication** | Medication Dose Reminders | ✅ Implemented | Prescriptions parsed into dose slots |
| **Medication** | Adherence Tracking | ✅ Implemented | "Take Dose" and "Skip" buttons |
| **Security** | Helmet Headers & Rate Limiting | ✅ Implemented | XSS protection & brute-force limits |
| **Security** | Error Sanitization & IDOR | ✅ Implemented | Production stack trace stripping |
| **AI / LLM** | Local Ollama Pre/Post-Visit | ✅ Implemented | Verbatim prompts, schema validation, zero-hallucination guardrails |
| **DevOps** | Production Deployment | ⏳ Next Phase | Strictly scheduled for Phase 11 |
| **Billing** | Payment Gateway Integration | ❌ Excluded | Out of scope |
| **Telehealth** | WebRTC Video Calling | ❌ Excluded | Out of scope |
| **Chat** | Real-time Doctor-Patient Chat | ❌ Excluded | Out of scope |

---

## 5. Architectural Guardrails & Source of Truth
- **Authoritative Database**: The backend and MongoDB are the single source of truth; frontend validations are UX-only.
- **Zero Medication Invention**: The system never invents drugs, dosages, or durations; everything originates from the doctor's structured prescription.
- **Non-Destructive Protection**: Doctor leave requests never silently cancel or delete active patient consultations.
- **Fail-Safe Asynchrony**: Background integrations (email, calendar, local LLM) execute out-of-band and never compromise core booking or clinical transactions.

---

## 6. System Design & Architectural Write-Up

### 6.1 Slot Hold Mechanism: The Reject-at-Confirm Architecture
In high-concurrency appointment scheduling systems, managing slot contention is a foundational design challenge. HealthPulse deliberately implements an **optimistic concurrency control model with a "reject-at-confirm" strategy** rather than relying on distributed stateful locks (such as Redis temporary TTL keys or database reservation rows).

Under this design, consultation time slots remain universally visible and selectable by prospective patients right up to the final moment of confirmation. No temporary hold or exclusive lock is acquired while a user browses slots, reviews doctor profiles, or types their intake symptoms. Instead, contention resolution is deferred entirely to the atomic commit phase at the database level. When multiple patients attempt to finalize a booking for the exact same doctor, date, and start time simultaneously, only the first request to execute the atomic write succeeds. The subsequent concurrent requests are intercepted by MongoDB's unique key constraint and returned immediately as a clean `409 Conflict` HTTP response (`"This appointment slot was just booked by another patient. Please select another slot."`).

This approach provides substantial architectural benefits over pessimistic reservation locks:
1. **Zero Deadlock & Phantom Abandonment**: Pessimistic holds introduce complex distributed state machines requiring active heartbeat TTLs, garbage-collection cleanup jobs, and edge-case handling for abandoned browser tabs, user network disconnections, or payment drop-offs. Reject-at-confirm avoids phantom unavailabilities where slots appear locked to genuine users while an abandoned session slowly expires.
2. **Stateless Scalability**: The API application servers remain strictly stateless. No shared memory cache coordination or multi-instance lock synchronization is required across cluster replicas.
3. **Deterministic UX**: Upon receiving a `409 Conflict`, the client UI automatically re-fetches the doctor's real-time availability for that date, disables the contested slot, and prompts the patient to select the nearest alternate slot with zero application restart or stranded data.

### 6.2 Doctor Leave Conflict Handling & Non-Destructive Integrity
Physician availability is inherently dynamic, necessitating robust mechanisms to reconcile leave applications with active patient bookings. HealthPulse implements a strict, non-destructive leave conflict engine in `leaveService.js` and `DoctorLeave.js`.

When a doctor submits a leave request spanning a date range (`startDate` to `endDate`), the system executes an authoritative pre-validation query against the `Appointment` collection:
```javascript
const conflictingAppointments = await Appointment.find({
  doctorId,
  date: { $gte: startDate, $lte: endDate },
  status: { $in: ['BOOKED'] },
});
```
If one or more active appointments exist within the requested window, the system **strictly rejects the leave submission with a `409 Conflict` error**, enumerating the specific conflicting dates.

This design enforces three vital guarantees:
- **No Silent Cancellations**: The system will never automatically cancel, drop, or reschedule patient appointments without human intervention. Patient bookings are protected assets.
- **Administrative Transparency**: Doctors must manually coordinate rescheduling or cancellations with affected patients prior to securing approved leave.
- **Slot Invalidation**: Once leave is approved, `slotService.js` actively cross-references the doctor's approved leave calendar during slot generation, completely removing those days from the booking grid and rejecting any direct booking attempts with `400 Bad Request`.

### 6.3 Database-Level Double-Booking Prevention
While application-level validation verifies slot validity prior to insertion, multi-threaded server environments are vulnerable to race conditions where two simultaneous requests pass validation checks in parallel. HealthPulse defends against race conditions through a **Database-Level Compound Partial Unique Index** on the `Appointment` model:
```javascript
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['BOOKED', 'COMPLETED'] },
    },
    name: 'unique_active_doctor_slot',
  }
);
```
The partial filter expression restricts uniqueness exclusively to active booking states (`BOOKED` and `COMPLETED`). When an appointment is transitioned to `CANCELLED`, it no longer matches the index predicate, immediately freeing the slot for other patients without requiring record deletion. Any race condition attempting to create duplicate active records triggers MongoDB error code `11000`, which the service layer catches and maps to a structured `409 Conflict` response.

### 6.4 Notification & Local LLM Failure Handling
HealthPulse enforces strict fault isolation for external and third-party subsystems (transactional email via Nodemailer, Google Calendar API synchronization, and local Ollama LLM generation).

The failure handling architecture adheres to three core guardrails:
1. **Decoupled Asynchronous Execution**: All side-effect operations—such as sending booking confirmation emails, queuing Google Calendar synchronization, generating pre-visit clinical summaries, and synthesizing post-visit discharge notes—are invoked non-blockingly via detached Promises (`.catch(...)`). A failure, timeout, or network crash in Ollama or SMTP never halts the database transaction or aborts the HTTP request. Patient booking and physician visit finalization always succeed.
2. **Bounded Retries with Exponential Backoff**: Integration clients (`emailService.js`, `llmService.js`) implement a bounded retry loop (maximum 2–3 attempts) with exponential backoff (`attempt * 300ms`). This absorbs transient port contention or local daemon warm-up latencies without causing request thread starvation or unbounded queuing.
3. **Explicit State Tracking & Graceful Degradation**: Both `Appointment` and `ClinicalRecord` maintain explicit `aiStatus` states (`PENDING`, `READY`, `FAILED`). If Ollama is unreachable or if the generated text fails strict schema or zero-hallucination validation (such as missing a prescribed medicine name), `aiStatus` is cleanly set to `FAILED`. The frontend UI checks `aiStatus` and renders a clean `"summary unavailable"` placeholder rather than breaking the layout or blocking clinical workflows.

