# HealthPulse — Evaluation Criteria & Implementation Matrix

| Evaluation Criterion | Implementation Location | Architectural Solution |
| :--- | :--- | :--- |
| **1. Problem-Solving & Concurrency** | `server/models/Appointment.js`, `server/services/appointmentService.js` | Compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` prevents double-booking at the DB layer. |
| **2. Doctor Leave Conflict Management** | `server/models/DoctorLeave.js`, `server/controllers/leaveController.js` | Overlap detection blocks slot generation and raises 409 Conflict if active appointments exist. |
| **3. Notification Reliability** | `server/services/email/emailService.js`, `server/jobs/reminderJob.js` | 3-attempt exponential backoff; failures are non-blocking and never compromise clinical transactions. |
| **4. Google Calendar Integration** | `server/services/google/googleCalendarService.js`, `server/routes/calendarRoutes.js` | OAuth2 token refresh, token redaction on JSON serialization, non-blocking event sync. |
| **5. Medication Adherence Scheduling** | `server/services/reminder/reminderScheduler.js`, `server/models/MedicationReminder.js` | Deterministic frequency/duration parser + compound idempotency index prevents duplicate reminders. |
| **6. Local LLM Architecture & Safety** | `server/services/llm/` (`llmService.js`, `ollamaProvider.js`, `validator.js`) | 100% local inference (Ollama), 25-30s timeout, bounded retry (2 attempts), zero-hallucination medicine validation. |
| **7. Security & IDOR Hardening** | `server/middleware/` (`authMiddleware.js`, `roleMiddleware.js`, `errorHandler.js`) | Helmet HTTP headers, rate limiting on `/api/auth`, payload size limits, ownership checks on all records. |
| **8. Automated Testing & Verification** | `server/tests/` (10 test suites in `runAllTests.js`) | 100% passing automated test suite covering authentication, slots, clinical notes, LLM schemas, and E2E flows. |
