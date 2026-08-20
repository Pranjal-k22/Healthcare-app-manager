# HealthPulse — File Inventory & Component Responsibilities

## Backend Modules (`server/`)

| File Path | Description |
| :--- | :--- |
| `server.js` | Server bootloader, MongoDB connection, and background cron worker initializer. |
| `app.js` | Express app configuration, security headers, rate limiting, and route registry. |
| `config/db.js` | MongoDB Mongoose connection handler. |
| `config/env.js` | Validated environment variables loader with sensible defaults. |
| `models/User.js` | User credentials schema with bcrypt hashing and RBAC roles. |
| `models/DoctorProfile.js` | Doctor profile, working hours, and slot duration configuration. |
| `models/Appointment.js` | Appointment booking schema with double-booking partial unique index. |
| `models/ClinicalRecord.js` | Doctor clinical notes schema and post-visit AI summary. |
| `models/Prescription.js` | Structured medication orders schema. |
| `models/DoctorLeave.js` | Doctor date-range leaves schema. |
| `models/Notification.js` | In-app alerts and delivery audit schema. |
| `models/CalendarConnection.js` | Google Calendar OAuth tokens schema with token stripping. |
| `models/MedicationReminder.js` | Patient dose schedule schema with compound idempotency index. |
| `services/appointmentService.js` | Slot generation, double-booking guard, and pre-visit AI trigger. |
| `services/clinicalService.js` | Consultation completion and post-visit AI trigger. |
| `services/email/emailService.js` | Nodemailer transporter with 3-attempt backoff. |
| `services/email/emailTemplates.js` | HTML and text transactional email builders. |
| `services/google/googleCalendarService.js` | Google OAuth2 client and non-blocking event sync. |
| `services/llm/llmService.js` | Local LLM orchestrator with bounded 2-attempt retry and backoff. |
| `services/llm/ollamaProvider.js` | Local Ollama REST client with timeout. |
| `services/llm/prompts.js` | Verbatim prompts and prompt injection defenses. |
| `services/llm/schemas.js` | LLM schemas, urgency enum, and versioning constants. |
| `services/llm/validator.js` | Pre-visit JSON validator and zero-hallucination medicine check. |
| `services/llm/llmErrors.js` | Custom error taxonomy hierarchy. |
| `jobs/reminderJob.js` | 60-second cron job dispatching appointment reminders. |
| `jobs/medicationReminderJob.js` | 60-second cron job dispatching medication reminders. |
| `middleware/authMiddleware.js` | JWT token verification and user context attachment. |
| `middleware/roleMiddleware.js` | Role-based access control middleware (`requireRole`). |
| `middleware/errorHandler.js` | Centralized production error sanitization handler. |
| `tests/runAllTests.js` | Master test runner executing all 10 automated test suites. |

## Frontend Modules (`client/src/`)

| File Path | Description |
| :--- | :--- |
| `context/AuthContext.tsx` | Global authentication state and JWT session provider. |
| `pages/auth/Login.tsx` & `Register.tsx` | Patient and Doctor authentication portals. |
| `pages/patient/PatientDashboard.tsx` | Patient overview, upcoming visits, and medication adherence. |
| `pages/patient/BookAppointment.tsx` | Slot selection and intake symptom submission. |
| `pages/patient/AppointmentDetails.tsx` | Completed appointment view with post-visit AI guidance card. |
| `pages/doctor/DoctorDashboard.tsx` | Doctor appointment queue and patient overview. |
| `pages/doctor/DoctorConsultation.tsx` | Clinical consultation room with pre-visit AI intake summary. |
| `pages/doctor/DoctorSchedule.tsx` | Doctor weekly working hours and slot duration manager. |
| `pages/admin/AdminDashboard.tsx` | System overview, doctor provisioning, and leave approvals. |
