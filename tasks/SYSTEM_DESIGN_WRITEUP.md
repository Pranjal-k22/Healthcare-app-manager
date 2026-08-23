# System Design Write-Up: Healthcare Appointment & Follow-up Manager

**Author**: HealthPulse Architecture Team  
**Word Count**: ~755 words  
**Core Design Topics**: Concurrency Control, Ephemeral Slot Reservation, Leave & Cascade Conflict Management, Notification Reliability, and LLM Guardrails.

---

### 1. High-Concurrency Double-Booking Prevention

In high-throughput clinical appointment systems, standard read-then-write checks introduce race conditions where concurrent requests both observe an available slot and commit overlapping bookings.

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
   This index enforces atomic uniqueness at the storage engine level. Because the partial filter only indexes `BOOKED` and `COMPLETED` records, cancelled or rescheduled visits immediately surrender their slot lock without table rebuilds.
3. **Optimistic Error Translation**: If two requests hit MongoDB simultaneously, the losing transaction triggers an `E11000 duplicate key error`. The error interceptor intercepts this error and transforms it into a clean `409 Conflict` HTTP response.

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
- **Automatic TTL Eviction**: If the patient abandons booking, MongoDB automatically evicts the hold document after 5 minutes, freeing the slot without requiring cron cleanup scripts.

---

### 3. Doctor Leave Conflict & Cascade Management

When a doctor logs leave, patient appointments are protected from silent cancellation:

1. **Pre-Check & Two-Stage Approval**: Doctor self-service requests (`POST /api/doctor/leaves`) pre-check for active bookings; conflicting dates return `409 Conflict` to prompt proactive rescheduling. Valid requests initialize in `PENDING` status awaiting administrative review.
2. **Admin Approval Cascade**: When an Admin approves a leave (`PATCH /api/admin/leaves/:id/status`) or applies a direct administrative schedule (`POST /api/doctors/:id/leave`), the conflict engine executes:
   ```javascript
   const conflicts = await Appointment.find({
     doctorId: leave.doctorId,
     date: { $gte: leave.startDate, $lte: leave.endDate },
     status: 'BOOKED'
   });
   ```
3. **Non-Destructive Slot Release & Patient Notification**:
   - Conflicting appointments transition to `status: 'CANCELLED'` with reason `DOCTOR_LEAVE`.
   - Associated Google Calendar events are deleted via background workers.
   - Asynchronously dispatches notifications containing doctor details and a direct link to reschedule.

---

### 4. Notification Failure & Reliability Architecture

Network timeouts and SMTP rate limits must never compromise core clinical transactions:

1. **Transactional Decoupling**: Email transmissions and Google Calendar sync execute asynchronously via HTTPS API (Resend SDK). Failures never roll back database writes or block user HTTP responses.
2. **Persistent Audit Logging**: Every dispatch creates a `NotificationLog` record tracking recipient, template, payload, status (`sent`, `failed`, `dead`), and attempt counter.
3. **Exponential Backoff Worker & Dead-Letter Queue**: The background `emailRetryJob` periodically queries `NotificationLog` where `status: 'failed'` and `nextRetryAt <= now()`, applying backoff delays ($2^{\text{attempts}}$ minutes) up to 5 retries. Permanently unretryable errors (such as Resend domain restrictions, HTTP 403/422 responses, or malformed email addresses) or notifications exceeding max attempts are immediately capped with status `DEAD` (`dead`) and `nextRetryAt: null`, halting retry log pollution.
4. **Empirical Failure-Handling & Domain Restriction Evidence**: In accordance with Resend free-tier restrictions (`onboarding@resend.dev`), delivery verification was executed against the verified Resend account owner email (`pranjalkaran2004@gmail.com`). Real-world 403 Forbidden / domain restriction responses encountered when targeting unverified external addresses served as empirical runtime validation for the Dead-Letter Queue and retry worker capping mechanism.

---

### 5. Hybrid Dual-Engine LLM Architecture & Safety Guardrails

HealthPulse operates a hybrid dual-engine architecture combining **Local Ollama** (on-device, privacy-preserving) and **Google Gemini** (cloud-scale reliability):

1. **Parallel Execution & Resilience**: AI generation executes both engines simultaneously via `Promise.allSettled`. If Ollama is offline (such as on cloud hosting), Gemini resolves the summary without failure.
2. **Deterministic Prompts**: Pre-visit intake synthesizes urgency and questions; post-visit translates clinical findings into plain-language instructions.
3. **Zero-Hallucination Guardrail (`validator.js`)**: Enforces that **100% of prescribed medicine names** appear verbatim in the post-visit summary before persistence.

---

### 6. Production Hardening, ACID Transactions & Live Verification

1. **Outbound Port Blocking & Resend Node.js SDK Migration (`ENETUNREACH`)**:
   - Deployment on cloud container hosts (Render free tier) produced `connect ENETUNREACH` network timeouts when attempting outbound SMTP connections on ports 25, 465, or 587.
   - Re-architected the email pipeline to use the official **Resend Node.js SDK over HTTPS API (port 443)**. Verified domain `health-pulse.app` with Resend (DKIM passing) and set production sender address to `HealthPulse <notifications@health-pulse.app>`.
   - Fixed a bug in `emailRetryJob.js` where string error objects caused `error.message` to evaluate to `'undefined'`, preventing permanent failures from being capped as `DEAD`.

2. **ACID MongoDB Session Transactions**:
   - Wrapped multi-collection updates (doctor leave approval cancelling appointments, cascading doctor deletion purging profiles/users/appointments/leaves) inside native **MongoDB session transactions (`session.withTransaction`)** in `leaveService.js` and `doctorService.js`.
   - Prevents partial state corruption during system restarts or unexpected errors.

3. **Fail-Fast Boot Security & Timezone-Aware Validation**:
   - Added startup environment validation in `server/config/env.js` throwing an immediate boot exception in `NODE_ENV === 'production'` if `JWT_SECRET` or `TOKEN_ENCRYPTION_KEY` are unconfigured.
   - Updated `appointmentValidator.js` (`getTodayDateString`, `getCurrentTimeString`) using `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })` (`YYYY-MM-DD`) so past-slot checks reflect Indian Standard Time regardless of server process clock (UTC on Render).

4. **14/14 Automated Integration Test Suite & Live Verification**:
   - Expanded automated test coverage (`server/tests/runAllTests.js`) to 14 test suites by adding `supertest` REST integration tests (`server/tests/api.test.js`).
   - Performed live empirical verification against production Render environment, confirming simultaneous concurrent bookings trigger `409 Conflict` and live doctor leave approval triggers atomic appointment cancellation (`DOCTOR_LEAVE`). All live test data was systematically purged after verification.

---

### 7. Process Lifecycle & Production Hosting

The backend runs Express and background schedulers (`reminderJob`, `medicationReminderJob`, `emailRetryJob`) in-process within a single Node.js event loop, engineered for **always-on container hosting** (e.g. Render Web Service).
