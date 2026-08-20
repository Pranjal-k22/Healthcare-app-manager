# HealthPulse — Live Evaluation Demonstration Script

This step-by-step script is designed for presenting and evaluating the HealthPulse system end-to-end.

---

## Prerequisites
1. Ensure MongoDB is running (`mongod`).
2. Start Ollama with the configured model: `ollama run llama3`.
3. Start backend: `npm run dev:server` (Port `5000`).
4. Start frontend: `npm run dev:client` (Port `5173`).

---

## 17-Step Live Demonstration Flow

1. **Patient Registration & Login**:
   - Register a new patient account (`john@example.com` / `Password123!`).
   - Observe automatic JWT token issuance and redirect to Patient Dashboard.

2. **Doctor Discovery & Search**:
   - Navigate to Doctor Directory (`/patient/book`).
   - Filter by specialization (e.g., Cardiology, General Medicine).

3. **Intake Symptoms Submission & Slot Booking**:
   - Select an available date and time slot.
   - Enter clinical symptoms (e.g. *"Severe throbbing headache with nausea for 3 days"*).
   - Confirm booking. Observe instant booking confirmation and pre-visit AI synthesis trigger.

4. **Doctor Consultation Room**:
   - Log in as Doctor (`sarah.jenkins@healthcare.com` / `DoctorPassword123!`).
   - Open Appointment Consultation Room (`/doctor/consultation/:appointmentId`).
   - **Showcase AI Feature 1**: Pre-Visit Clinical Intake Summary Card displaying **Urgency Badge** (`High`), **Chief Complaint**, and **3 Suggested Diagnostic Questions**.

5. **Clinical Notes & Structured Prescription**:
   - Doctor records examination findings and diagnostic impressions.
   - Adds structured medications (e.g., `Amoxicillin`, `500mg`, `Three times daily`, `7 days`).
   - Completes consultation.

6. **Patient Post-Visit Guidance View**:
   - Log in as Patient and open the completed appointment (`/patient/appointments/:id`).
   - **Showcase AI Feature 2**: Post-Visit Patient Guidance Card explaining diagnosis, care steps, and medication schedule in simple language with 100% medication name fidelity.

7. **Medication Reminders & Adherence**:
   - View the Medication Adherence Timeline (`/patient/dashboard`).
   - Mark a dose as **TAKEN**. Observe real-time adherence percentage update.

8. **Google Calendar Synchronization**:
   - Navigate to Settings / Calendar and connect Google Calendar.
   - Observe synchronized appointment event in Google Calendar.

9. **Concurrency & Double-Booking Protection**:
   - Demonstrate two simultaneous booking requests for the same slot.
   - Observe the first request succeed and the second cleanly reject with `409 Conflict`.

10. **Doctor Leave Conflict Protection**:
    - Log in as Admin / Doctor and create a Leave request covering an existing appointment date.
    - Observe 409 conflict detection and automatic blocking of slots during leave.

11. **Graceful Ollama Failure Simulation**:
    - Terminate the Ollama process.
    - Book an appointment and complete a consultation.
    - Observe that core clinic workflows succeed without crashing; UI safely displays `"AI summary unavailable"`.
