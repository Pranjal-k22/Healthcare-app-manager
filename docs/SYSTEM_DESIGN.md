# HealthPulse — System Design Write-Up

## 1. Double-Booking Prevention & Concurrency Control
HealthPulse implements a multi-tier concurrency model to eliminate race conditions and double-bookings:
- **Database Partial Unique Compound Index**: A partial unique index is enforced on `{ doctorId: 1, date: 1, startTime: 1 }` filtered strictly on active states `{ status: { $in: ['BOOKED', 'COMPLETED'] } }`. If two patients submit bookings simultaneously, MongoDB atomic index enforcement allows exactly one to succeed while rejecting the competitor with error code `11000`, translated by Express into a clean HTTP `409 Conflict`.
- **Cancelled Slot Recycling**: When an appointment is cancelled, the partial index filter excludes the cancelled record, allowing the slot to become bookable again without record deletion.

## 2. Slot Hold Mechanism (Temporary Reservation)
To prevent checkout collisions while a patient inputs intake symptoms:
- **5-Minute TTL Ephemeral Holds**: When a patient selects an available slot, a `SlotHold` record is created with a TTL index (`createdAt: 1, expireAfterSeconds: 300`).
- **Conflict Checking**: Available slot queries dynamically cross-reference active `SlotHold` records. If a slot is held by another patient, it is marked unavailable.
- **Auto-Release & Consumption**: Upon successful booking completion, the patient's hold is deleted. If the patient abandons the flow, MongoDB automatically purges the hold after 5 minutes.

## 3. Doctor Leave Conflict Handling & Data Integrity
When an administrator marks a doctor as on leave for a date or date range:
- **Overlap Detection**: The system validates that `startDate <= endDate` and prevents backdated leave requests.
- **Active Booking Discovery**: The leave service queries all existing appointments matching `{ doctorId, date: { $gte: startDate, $lte: endDate }, status: 'BOOKED' }`.
- **Preservation & Notification Pipeline**: Existing appointments are updated with `status: 'CANCELLED'` and `cancellationReason: 'DOCTOR_LEAVE'`.
- **Automated Communication**: Each affected patient receives an immediate high-priority cancellation email explaining the doctor's unavailability, along with a direct link to reschedule.

## 4. Notification Reliability & Failure Handling
HealthPulse decouples all email transmissions and third-party integrations from the HTTP request-response cycle:
- **Fire-and-Forget Asynchronous Dispatch**: Controllers respond immediately to client requests before dispatching emails or queueing calendar sync tasks.
- **Idempotent Notification Logs**: Every outbound notification creates a `NotificationLog` record tracking recipient, channel, payload, status (`PENDING`, `SENT`, `FAILED`), and attempt count.
- **Exponential Backoff Background Worker**: A persistent background worker runs every 10 minutes to scan for failed emails with attempts `< 5`, applying exponential backoff delay (`min(120, 2^attempt) minutes`) before retrying via Nodemailer SMTP.

## 5. Local LLM Clinical Decision Support & Zero-Hallucination Guardrail
HealthPulse integrates a local Ollama model (`qwen2.5-coder:7b` / `llama3`) strictly as an explanation and assistance mechanism:
- **Pre-Visit Clinical Synthesis**: Generates triage urgency (`Low`/`Medium`/`High`), concise chief complaint, and exactly 3 doctor exploration questions from patient symptoms.
- **Post-Visit Patient Guidance**: Converts doctor clinical notes and structured prescriptions into patient-friendly summaries, medication schedules, and follow-up guidance.
- **Zero-Hallucination Hard Guardrail**: The validator checks that 100% of prescribed medicine names appear verbatim in the post-visit output before persisting to MongoDB; if any drug is dropped or renamed, the summary is rejected with `aiStatus = FAILED`.
- **Fault-Tolerant Retries**: Max 2 bounded attempts with `attempt * 300ms` backoff and 28-second timeouts ensure the application never blocks core clinic workflows if Ollama is slow or offline.
