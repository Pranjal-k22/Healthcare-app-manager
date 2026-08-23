# System Design Write-Up: Healthcare Appointment & Follow-up Manager

**Author**: HealthPulse Architecture Team  
**Word Count**: ~755 words  
**Core Design Topics**: Concurrency Control, Ephemeral Slot Reservation, Leave & Cascade Conflict Management, Notification Reliability, and LLM Guardrails.

---

### 1. High-Concurrency Double-Booking Prevention

In high-throughput clinical appointment systems, standard read-then-write checks introduce race conditions where concurrent requests both observe an available slot and commit overlapping bookings.

HealthPulse prevents double-booking using a **three-tier defensive architecture**:

```text
[Incoming Booking Request] ──► 1. Schedule Pre-Flight Check ──► 2. Partial Unique Index ──► 3. E11000 Catch ➔ 409 Conflict
```

1. **Pre-Flight Validation**: Validates slot boundaries against doctor weekly schedules, buffer rules, and active leaves.
2. **Database Engine Hard Constraint**: 
   ```javascript
   appointmentSchema.index(
     { doctorId: 1, date: 1, startTime: 1 },
     {
       unique: true,
       partialFilterExpression: { status: { $in: ['BOOKED', 'COMPLETED'] } },
       name: 'unique_active_doctor_slot'
     }
   );
   ```
   This index enforces atomic uniqueness at the storage engine level. Because the partial filter only indexes `BOOKED` and `COMPLETED` records, cancelled or rescheduled visits immediately surrender their slot lock without index rebuild overhead.
3. **Optimistic Error Translation**: If two requests hit MongoDB simultaneously, the losing transaction triggers an `E11000 duplicate key error`. The error interceptor transforms this into a clean `409 Conflict` HTTP response.

---

### 2. Ephemeral Slot Hold Mechanism (Temporary Reservation)

To prevent checkout collisions while a patient completes symptoms and intake questions:
- When a patient selects an available slot, an ephemeral `SlotHold` record is created with an advisory token:
  ```javascript
  const slotHoldSchema = new Schema({
    doctorId: { type: ObjectId, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    patientId: { type: ObjectId, required: true },
    expiresAt: { type: Date, default: () => Date.now() + 5 * 60 * 1000 }
  });
  slotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Native TTL Index
  ```
- **Dynamic Slot Generation**: Available slot queries subtract both active `Appointment` documents and unexpired `SlotHold` documents from the doctor's working hours.
- **Automatic TTL Eviction**: If the patient abandons booking, MongoDB automatically evicts the hold document after 5 minutes, freeing the slot without cron cleanup scripts.

---

### 3. Doctor Leave Conflict & Cascade Management

When a doctor logs leave, patient appointments are protected from silent cancellation:

1. **Pre-Check & Approval**: Doctor self-service requests (`POST /api/doctor/leaves`) pre-check for active bookings; conflicting dates return `409 Conflict` to prompt proactive rescheduling. Valid requests initialize in `PENDING` status.
2. **ACID Transaction Cascade**: When an Admin approves a leave (`PATCH /api/admin/leaves/:id/status`) or applies a direct schedule (`POST /api/doctors/:id/leave`), all multi-collection updates execute inside a native MongoDB session transaction (`session.withTransaction`):
   - Conflicting appointments transition to `status: 'CANCELLED'` with reason `DOCTOR_LEAVE`.
   - Associated Google Calendar events are deleted via background workers.
   - Asynchronously dispatches notifications containing doctor details and direct reschedule links.

---

### 4. Notification Failure & Reliability Architecture

Network timeouts and SMTP rate limits must never compromise core clinical transactions:

1. **Transactional Decoupling**: Email transmissions and Google Calendar sync execute asynchronously via HTTPS API (Resend Node.js SDK over port 443). Failures never roll back database writes or block user HTTP responses.
2. **Persistent Audit Logging**: Every dispatch creates a `NotificationLog` record tracking recipient, template, payload, status (`sent`, `failed`, `dead`), and attempt counter.
3. **Exponential Backoff Worker & Dead-Letter Queue**: The background `emailRetryJob` periodically queries `NotificationLog` where `status: 'failed'` and `nextRetryAt <= now()`, applying backoff delays ($2^{\text{attempts}}$ minutes) up to 5 retries. Permanently unretryable errors (HTTP 403/422 domain restrictions or malformed addresses) or capped retries transition to status `DEAD` (`dead`) with `nextRetryAt: null`, halting retry log pollution.

---

### 5. Hybrid Dual-Engine LLM Architecture & Safety Guardrails

HealthPulse operates a hybrid dual-engine architecture combining **Local Ollama** (on-device, privacy-preserving) and **Google Gemini** (cloud-scale reliability):

1. **Parallel Execution & Resilience**: AI generation executes both engines simultaneously via `Promise.allSettled`. If Ollama is offline (such as on cloud hosting), Gemini resolves the summary gracefully.
2. **Zero-Hallucination Guardrail (`validator.js`)**: Enforces that **100% of prescribed medicine names** appear verbatim in the post-visit summary before persistence.

---

### 6. Process Lifecycle & Production Hosting

The backend runs Express and background schedulers (`reminderJob`, `medicationReminderJob`, `emailRetryJob`) in-process within a single Node.js event loop, engineered for **always-on container hosting** (Render Web Service).
