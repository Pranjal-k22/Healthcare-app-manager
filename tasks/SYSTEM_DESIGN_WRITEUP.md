# System Design Write-Up: Healthcare Appointment & Follow-up Manager

**Author**: HealthPulse Architecture Team  
**Word Count**: ~820 words  
**Core Design Topics**: Concurrency Control, Ephemeral Slot Reservation, Leave & Cascade Conflict Management, Notification Reliability, Hybrid Dual-Engine LLM Architecture, and Always-On Process Lifecycle.

---

### 1. High-Concurrency Double-Booking Prevention

In high-throughput clinical appointment systems, standard read-then-write checks introduce critical race conditions: two concurrent booking requests both query an open slot, receive positive confirmations, and commit overlapping bookings.

HealthPulse prevents double-booking using a **three-tier defensive architecture**:

```text
[Incoming Booking Request]
          │
          ▼
┌─────────────────────────────────┐
│ 1. Application Pre-Flight Check │ (Working hours, breaks, slot boundaries)
└─────────────────┬───────────────┘
                  ▼
┌────────────────────────────────────────────────────────┐
│ 2. Atomic MongoDB Partial Unique Index                 │
│    { doctorId: 1, date: 1, startTime: 1 }              │
│    partialFilterExpression: { status: { $in: ['BOOKED', 'COMPLETED'] } } │
└─────────────────┬──────────────────────────────────────┘
                  ▼
┌────────────────────────────────────────────────────────┐
│ 3. Database E11000 Duplicate Key Catch ➔ 409 Conflict  │
└────────────────────────────────────────────────────────┘
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
   This index enforces atomic uniqueness at the storage engine level. Because the filter only indexes `BOOKED` and `COMPLETED` records, cancelled or rescheduled visits immediately surrender their slot lock without table rebuilds.
3. **Optimistic Error Translation**: If two requests hit MongoDB simultaneously, the losing transaction triggers an `E11000 duplicate key error`. The error interceptor intercepts this error and transforms it into a clean `409 Conflict` HTTP response: `"This appointment slot was just booked by another patient. Please choose an alternate time."`

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
- **Dynamic Slot Generation**: The available slot engine computes open intervals by subtracting both active `Appointment` documents and unexpired `SlotHold` documents from the doctor's working hours.
- **Automatic TTL Eviction**: If the patient abandons booking or closes the browser, MongoDB automatically evicts the hold document after 5 minutes, freeing the slot without requiring cron cleanup scripts.

---

### 3. Doctor Leave Conflict & Cascade Management

When a doctor logs leave, patient appointments are protected from silent cancellation:

1. **Two-Stage Approval Workflow**: Doctor leave applications initialize in `PENDING` status and trigger automated email alerts to hospital administrators. Upon admin review, approving the leave transitions status to `APPROVED` and engages the conflict engine.
2. **Cascade Conflict Detection**: Queries all booked appointments overlapping the leave window:
   ```javascript
   const conflicts = await Appointment.find({
     doctorId,
     date: { $gte: startDate, $lte: endDate },
     status: 'BOOKED'
   });
   ```
3. **Non-Destructive Slot Release & Patient Re-engagement**:
   - Conflicts are updated to `status: 'CANCELLED'` with reason `Doctor on approved medical leave`.
   - Associated Google Calendar events are deleted via background workers.
   - Asynchronously dispatches `doctorLeaveConflict` emails containing doctor details, affected date/time, and a direct 1-click CTA link to reschedule with an alternate physician or select a future date.

---

### 4. Notification Failure & Reliability Architecture

Network timeouts and SMTP rate limits must never compromise core clinical transactions:

1. **Transactional Decoupling**: All email transmissions and Google Calendar sync calls execute asynchronously in the background via Node.js `setImmediate()`. Failures never roll back database writes or block user HTTP responses.
2. **Persistent Audit Logging**: Every dispatch creates a `NotificationLog` record tracking recipient email, template name, payload, status (`sent` / `failed`), and attempt counter.
3. **Exponential Backoff Worker**: The in-process `emailRetryJob` periodically queries `NotificationLog` where `status: 'failed'` and `nextRetryAt <= now()`, applying backoff delays:
   $$\text{Retry Delay} = 2^{\text{attempts}} \text{ minutes}$$
   After 5 consecutive failures, notifications transition to `dead` for administrative inspection.

---

### 5. Hybrid Dual-Engine LLM Architecture & Safety Guardrails

HealthPulse operates a hybrid dual-engine architecture combining **Local Ollama** (on-device, privacy-preserving) and **Google Gemini** (cloud-scale reliability):

1. **Parallel Execution & Resilience**: AI generation executes both engines simultaneously via `Promise.allSettled`. If Ollama is offline or unavailable (such as in cloud hosting), Gemini resolves the summary without failure.
2. **Deterministic Prompts**:
   - **Pre-Visit Prompt (`pre-visit-v1`)**: Analyzes raw patient symptoms into structured urgency level, chief complaint, and 3 exploration questions.
   - **Post-Visit Prompt (`post-visit-v1`)**: Translates clinical findings and prescriptions into plain-language instructions, dosage schedules, and follow-up precautions.
3. **Zero-Hallucination Guardrail (`validator.js`)**: Before saving post-visit summaries to MongoDB, the validation layer enforces that **100% of prescribed medicine names** appear verbatim in the output text. If any drug is missing or altered, the output is rejected with `LLMHallucinationGuardError` and flagged as `FAILED`.

---

### 6. Process Lifecycle & Production Hosting Considerations

The backend runs Express and 4 background cron timers (`reminderJob`, `medicationReminderJob`, `billingAndPrescriptionJob`, `emailRetryJob`) in-process within a single Node.js 20 event loop. In production, this requires an **always-on container service** (e.g. Render, Railway, Fly.io, or VPS) rather than scale-to-zero serverless functions, ensuring background medication and appointment reminders remain continuously active.

