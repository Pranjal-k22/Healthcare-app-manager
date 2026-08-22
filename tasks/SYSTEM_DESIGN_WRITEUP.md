# System Design Write-Up: Healthcare Appointment & Follow-up Manager

**Author**: HealthPulse Architecture Team  
**Length**: ~740 words  
**Core Topics**: Double-Booking Prevention, Doctor Leave Conflict Handling, Slot Hold Mechanism, Notification Failure Handling.

---

### 1. High-Concurrency Double-Booking Prevention

In a high-throughput medical booking platform, standard read-then-write checks introduce race conditions where two simultaneous requests see an open slot and both persist bookings.

HealthPulse prevents double-booking using a **three-tier defensive architecture**:

```text
[Incoming Booking Request]
          │
          ▼
┌─────────────────────────────────┐
│ 1. In-Memory Validation & Check │
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

1. **Application-Level Pre-Flight Validation**: Validates date formats, working hours, breaks, and existing bookings.
2. **Atomic Partial Unique Index at the Database Engine**:
   ```javascript
   appointmentSchema.index(
     { doctorId: 1, date: 1, startTime: 1 },
     { 
       unique: true, 
       partialFilterExpression: { status: { $in: ['BOOKED', 'COMPLETED'] } } 
     }
   );
   ```
   This ensures MongoDB atomically permits only one active document (`BOOKED` or `COMPLETED`) for any given doctor, date, and start time.
3. **Optimistic Error Translation**: If two requests hit MongoDB simultaneously, the losing transaction triggers an `E11000 duplicate key error`. The error interceptor catches this code and converts it to a clean `409 Conflict` HTTP response: `"This appointment slot was just booked by another patient. Please choose an alternate time."`

---

### 2. Slot Hold Mechanism (Temporary Reservation)

To prevent checkout collision while a patient completes the symptom questionnaire:
- When a patient selects a slot, the server creates an ephemeral `SlotHold` document:
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
- **Dynamic Slot Generation Filter**: The slot engine queries both active `Appointment` records and unexpired `SlotHold` records, filtering occupied slots from search results.
- **Automatic TTL Eviction**: If the patient abandons booking, MongoDB automatically evicts the hold document after 5 minutes, releasing the slot without requiring cron cleanup scripts.

---

### 3. Doctor Leave Conflict & Cascade Management

When a doctor logs an unexpected leave, existing patient bookings are protected from silent cancellation:

1. **Overlap & Past Date Guard**: Validates that leave start/end dates are sequential and in the future. Overlapping active leaves are rejected.
2. **Cascade Conflict Detection**: Queries all booked appointments within the leave window:
   ```javascript
   const conflicts = await Appointment.find({
     doctorId,
     date: { $gte: startDate, $lte: endDate },
     status: 'BOOKED'
   });
   ```
3. **Automated Patient Notification & Slot Release**:
   - Updates conflicting appointment statuses to `CANCELLED` with reason `Doctor on approved medical leave`.
   - Releases slot holds and Google Calendar events via background workers.
   - Asynchronously dispatches `doctorLeaveConflict` emails and in-app notifications containing the doctor's name, affected date/time, and a direct one-click CTA link (`/patient/doctors`) to reschedule with an alternate physician or select a future slot.

---

### 4. Notification Failure & Reliability Architecture

Email delivery and calendar synchronization are prone to external network timeouts and rate limits. The platform treats all external communications as **asynchronous, non-blocking operations**:

1. **Transactional Decoupling**: `emailService.sendEmail` and `calendarJob` run after the core database write. A failure never rolls back the patient's appointment.
2. **Audit Logging**: Every send attempt is written to `NotificationLog` with payload, recipient email, template name, and status (`sent` / `failed`).
3. **Exponential Backoff Worker**: A background scheduler (`emailRetryJob.js`) scans `NotificationLog` where `status: 'failed'` and `nextRetryAt <= now()`.
   - Attempt 1: Retries after $2^1 = 2$ minutes.
   - Attempt 2: Retries after $2^2 = 4$ minutes.
   - Attempt 3: Retries after $2^3 = 8$ minutes.
   - Attempt 4: Retries after $2^4 = 16$ minutes.
   - Attempt 5: Final attempt. If failed, marked as `dead` for administrative review.

---

### 5. Local LLM Clinical Decision Support & Prompt Safety

The AI layer operates strictly as an asynchronous explanation mechanism (`llmService.js`) with zero-hallucination guardrails:
1. **Pre-Visit Clinical Intake**: Extracts triage urgency, chief complaint, and exactly 3 doctor exploration questions.
2. **Post-Visit Guidance & Prompt Disclosure**: The post-visit prompt embodies the core assignment brief requirement (`"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>"`), augmented with structured prescription items and JSON schema constraints specifically to guarantee deterministic parsing and enforce that 100% of prescribed medicine names appear verbatim in the output.
