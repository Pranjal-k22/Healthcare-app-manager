# HealthPulse — System Architecture & Data Flow

## 1. High-Level Architectural Diagram

```text
                               React 18 + Vite (Client)
                                          │
                                          ▼  HTTPS / REST API (JWT Bearer Auth)
                                   Express Backend
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   ▼                      ▼                      ▼
           MongoDB Database      Background Cron Jobs       LLM Service Layer
           (Source of Truth)       (60-Second Loop)              │
                   │                      │                      ▼
       ┌───────────┴───────────┐          │                Ollama Runtime
       ▼                       ▼          │             (http://localhost:11434)
  Appointments            Doctor Leaves   │                      │
  Clinical Records        Prescriptions   │                      ▼
  Users / Roles           Reminders       │                 Local Model
                                          │           (llama3 / qwen2.5 / mistral)
                                          ▼
                         Transactional Notifications &
                        External Sync (Non-Blocking)
                                  │       │
                 ┌────────────────┘       └────────────────┐
                 ▼                                         ▼
         Email Transporter                     Google Calendar API
       (Nodemailer / SMTP)                   (OAuth2 / Calendar Sync)
```

---

## 2. Component Layer Responsibilities

### 1. Presentation Layer (Client)
- **Framework**: React 18, TypeScript, Vite.
- **Routing**: React Router v6 with `<ProtectedRoute>` role gates (`PATIENT`, `DOCTOR`, `ADMIN`).
- **State Management**: Context API (`AuthContext.tsx`) managing authenticated session, user role, and token.
- **Isolation Constraint**: The client **never** interacts directly with Ollama, SMTP servers, or MongoDB. All interactions pass through the Express REST API.

### 2. API & Routing Layer (Backend)
- **Framework**: Node.js, Express.js.
- **Security Middleware**:
  - `helmet`: Enforces modern HTTP security headers.
  - `express-rate-limit`: Protects sensitive routes (`/api/auth`) from brute force attacks.
  - `express.json({ limit: '1mb' })`: Prevents large payload abuse.
  - `authMiddleware.js`: Validates JWT signature and extracts user context.
  - `roleMiddleware.js`: Enforces strict Role-Based Access Control (`requireRole`).
  - `errorHandler.js`: Centralized error handling stripping stack traces in production.

### 3. Service Layer
- **Appointment Service (`appointmentService.js`)**: Calculates doctor availability, enforces double-booking prevention, triggers pre-visit LLM synthesis.
- **LLM Service (`llmService.js`)**: Manages simultaneous parallel execution of Local Ollama and Google Gemini with bounded timeouts, schema validation, and zero-hallucination medicine presence checking.
- **Google Calendar Service (`googleCalendarService.js`)**: Manages OAuth2 token refresh, event synchronization, and deletion on cancellation.

### 4. Persistence Layer (MongoDB)
- MongoDB is the **single source of truth** for all healthcare records.
- Database-level compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` with `{ status: { $in: ['BOOKED', 'COMPLETED'] } }` guarantees atomic double-booking prevention.

### 5. Background Jobs Layer
- **Appointment Reminder Worker (`reminderJob.js`)**: Runs every 60 seconds, detects appointments starting within 60 minutes, and dispatches in-app and email reminders.
- **Medication Reminder Worker (`medicationReminderJob.js`)**: Runs every 60 seconds, scans active dose schedules, and dispatches adherence notifications.
