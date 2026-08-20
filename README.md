# Healthcare Appointment & Follow-up Manager (HealthPulse)

Healthcare Appointment & Follow-up Management System — **Phase 1: Foundation & Authentication**, **Phase 2: Doctor Management**, **Phase 3: Appointment Engine**, **Phase 4: Doctor Clinical Workflow**, **Phase 5: Notifications & Background Jobs**, **Phase 6: Google Calendar Integration**, **Phase 7: Leave Conflict & Reliability**, **Phase 8: Medication Reminders**, and **Phase 9: Testing & Security Hardening**.

---

## 🚀 Active Features

### Phase 1 — Foundation & Authentication
- ✅ **Backend REST API**: Node.js & Express architecture with modular routes, controllers, and centralized error handling.
- ✅ **Database Persistence**: MongoDB with Mongoose ODM and unique user indexes.
- ✅ **Stateless Authentication**: JSON Web Token (JWT) issuing, Bearer verification middleware.
- ✅ **Role-Based Access Control (RBAC)**: Enforced segregation across `PATIENT`, `DOCTOR`, and `ADMIN`.
- ✅ **Admin Seeder**: Dedicated seeder for the initial administrator account (`npm run seed:admin`).

### Phase 2 — Doctor Management
- ✅ **DoctorProfile Model**: Dedicated profile collection linked to `User` via unique `userId`.
- ✅ **Weekly Working Hours**: Structured Monday–Sunday schedules with `HH:mm` 24-hour validation (`start < end`).
- ✅ **Slot Duration**: Configurable consultation slot lengths (15, 20, 30, 45, 60 minutes).
- ✅ **Leave Management**: Calendar leave dates (`YYYY-MM-DD`) with duplicate prevention and removal endpoints.
- ✅ **Admin Doctor Provisioning**: Admin interface & REST endpoints to create, update, and manage doctors.
- ✅ **Patient Doctor Search**: Real-time filtering by doctor name, keyword, and medical specialization.
- ✅ **Doctor Self-View**: Verified profile and schedule inspection view for doctors (`/doctor/profile`).
- ✅ **Doctor Seeder**: Sample doctors seeding script (`npm run seed:doctors`).

### Phase 3 — Appointment Engine
- ✅ **Appointment Model**: Dedicated appointment collection with ownership references (`patientId`, `doctorId`).
- ✅ **Double-Booking Prevention**: MongoDB compound partial unique index on `{ doctorId: 1, date: 1, startTime: 1 }` for active bookings (`status IN ['BOOKED', 'COMPLETED']`).
- ✅ **Dynamic Slot Generator**: Deterministic slot calculation engine respecting doctor working hours, durations, leaves, past dates, and live booking collisions.
- ✅ **Patient Booking Flow**: Interactive date & slot picker with double-click submission guard and instant confirmation card.
- ✅ **Atomic Rescheduling**: Safe two-step transition where old appointment remains active if the new slot booking fails or conflicts.
- ✅ **Doctor Consultation Queue**: Schedule terminal with today, upcoming, and past consultation views and one-click visit completion.
- ✅ **Admin Appointment Management**: Clinic-wide appointment directory with doctor, date, and status filters.

### Phase 4 — Doctor Clinical Workflow
- ✅ **ClinicalRecord Model**: Dedicated clinical records collection linked 1:1 with `Appointment`.
- ✅ **Prescription Model**: Dedicated structured prescription collection with medication array (`name`, `dosage`, `frequency`, `duration`, `instructions`).
- ✅ **Doctor Consultation Room**: Clinical examination interface (`/doctor/consultation/:appointmentId`) for reviewing intake complaints, recording findings, creating prescriptions, and completing consultations.
- ✅ **Patient Post-Visit View**: Post-consultation page (`/patient/appointments/:id`) allowing patients to inspect verified clinical advice and structured prescriptions.
- ✅ **Clinical Authorization & IDOR Protection**: Strict ownership checks ensuring only assigned doctors can create/edit notes, while patients receive read-only post-visit summaries.

### Phase 5 — Notifications & Background Jobs
- ✅ **Notification Model**: Dedicated in-app notification storage with read status and appointment reference.
- ✅ **Lifecycle Event Dispatchers**: Automated in-app and email notifications for bookings, cancellations, reschedules, and prescription readiness.
- ✅ **Background Reminder Scheduler**: Periodic scanner checking upcoming consultations within a configurable window (default 60 mins) with duplicate notification prevention.
- ✅ **Email Service & Resilient Delivery**: Nodemailer integration with retry loops (up to 3 attempts) and mock development fallback.
- ✅ **Frontend Notification Bell**: Interactive unread count badge, real-time polling, and direct navigation links in Navbar.
- ✅ **Notification Management Page**: Dedicated `/notifications` dashboard for browsing, filtering unread alerts, and deleting notifications.

### Phase 6 — Google Calendar Integration
- ✅ **Google OAuth 2.0 Flow**: User consent screen flow with CSRF state protection and offline access token refresh.
- ✅ **CalendarConnection Model**: Secure token persistence with automatic stripping from client responses.
- ✅ **Non-Blocking Calendar Synchronization**: Background event creation, atomic updates on reschedule, and deletion on cancellation.
- ✅ **Privacy Preservation**: Strict omission of clinical notes, diagnoses, and prescriptions from external Google Calendar payloads.
- ✅ **Frontend Calendar Settings**: Self-service Connect and Disconnect controls in Doctor Profile and Patient Appointments.

### Phase 7 — Leave Conflict & Reliability
- ✅ **DoctorLeave Model**: Dedicated collection tracking date range leaves (`startDate` to `endDate`), reasons, and statuses.
- ✅ **Appointment Conflict Prevention**: Automatic detection of active appointments in requested leave periods (returns `409 Conflict` and prevents silent cancellation of patient bookings).
- ✅ **Authoritative Backend Protection**: Slot generator and booking controller actively reject bookings on approved leave dates.
- ✅ **Doctor Leave Manager UI**: Real-time conflict pre-check and leave scheduler in Doctor Profile (`/doctor/profile`).

### Phase 8 — Medication Reminders
- ✅ **MedicationReminder Model**: Structured dose tracking linked to prescriptions with compound idempotency unique index.
- ✅ **Deterministic Schedule Parser**: Automatic mapping of frequencies and durations to discrete dose reminder slots (`08:00`, `14:00`, `20:00`).
- ✅ **Background Dose Worker**: Periodically checks due doses and dispatches in-app notifications and reminder emails.
- ✅ **Adherence Tracking UI**: Interactive dose timeline on Patient Dashboard (`/patient/dashboard`) with "Take Dose" and "Skip" controls.

### Phase 9 — Testing & Security Hardening
- ✅ **Automated Test Suite**: 9 comprehensive test suites covering Auth, Appointments, Clinical Records, Leaves, Notifications, Google Calendar, Medication Reminders, Security Hardening, and End-to-End Workflow.
- ✅ **Helmet HTTP Headers**: Enforced defense against XSS, MIME sniffing, clickjacking, and header tampering.
- ✅ **Rate Limiting**: Integrated `express-rate-limit` on `/api/auth` to prevent brute-force attacks.
- ✅ **Error Sanitization**: Production error handler completely strips stack traces and internal schema paths.
- ✅ **IDOR & Mass Assignment Defense**: Validated resource ownership across all endpoints and prevented unauthorized role escalation.

---

## 📁 Directory Structure

```text
healthcare-appointment-manager/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, ProtectedRoute, NotificationBell
│   │   │   ├── doctor/         # DoctorCard, DoctorSearchBar, WorkingHoursForm, LeaveList, DoctorLeaveManager
│   │   │   ├── appointment/    # SlotPicker, AppointmentCard, AppointmentStatusBadge, RescheduleModal, CancelAppointmentModal
│   │   │   ├── clinical/       # PrescriptionEditor, PrescriptionCard
│   │   │   ├── calendar/       # CalendarSettingsCard
│   │   │   └── patient/        # MedicationReminderList
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── admin/          # ManageDoctors, CreateDoctor, EditDoctor, ManageDoctorLeave, ManageAppointments
│   │   │   ├── doctor/         # DoctorProfile, DoctorAppointments, DoctorConsultation
│   │   │   ├── patient/        # DoctorSearch, DoctorDetails, BookAppointment, MyAppointments, AppointmentDetails
│   │   │   ├── notifications/  # NotificationsPage
│   │   │   └── dashboard/      # Dashboards (PatientDashboard, DoctorDashboard, AdminDashboard)
│   │   ├── services/           # apiClient, authApi, doctorApi, appointmentApi, clinicalApi, notificationApi, calendarApi, leaveApi, medicationReminderApi
│   │   ├── types/              # auth.ts, doctor.ts, appointment.ts, clinical.ts, notification.ts, calendar.ts, leave.ts, medicationReminder.ts
│   │   ├── utils/              # constants.ts
│   │   ├── App.tsx             # Routing & Layout
│   │   ├── main.tsx            # Entrypoint
│   │   └── index.css           # Global Theme & Design Tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Express REST API
│   ├── config/                 # db.js, env.js
│   ├── controllers/            # authController.js, doctorController.js, appointmentController.js, clinicalController.js, notificationController.js, calendarController.js, leaveController.js, medicationReminderController.js
│   ├── middleware/             # authMiddleware.js, roleMiddleware.js, errorMiddleware.js
│   ├── models/                 # User.js, DoctorProfile.js, Appointment.js, ClinicalRecord.js, Prescription.js, Notification.js, CalendarConnection.js, DoctorLeave.js, MedicationReminder.js
│   ├── routes/                 # authRoutes.js, doctorRoutes.js, appointmentRoutes.js, clinicalRoutes.js, notificationRoutes.js, calendarRoutes.js, leaveRoutes.js, medicationReminderRoutes.js
│   ├── services/               # doctorService.js, slotService.js, appointmentService.js, clinicalService.js, notificationService.js, leaveService.js
│   │   ├── email/              # emailService.js, emailTemplates.js
│   │   ├── google/             # googleCalendarService.js
│   │   ├── medication/         # medicationScheduleService.js
│   │   └── jobs/               # reminderJob.js, calendarJob.js, medicationReminderJob.js
│   ├── tests/                  # Automated test suites
│   │   ├── auth.test.js
│   │   ├── appointment.test.js
│   │   ├── clinical.test.js
│   │   ├── leave.test.js
│   │   ├── notification.test.js
│   │   ├── calendar.test.js
│   │   ├── medication.test.js
│   │   ├── security.test.js
│   │   ├── e2e.test.js
│   │   └── runAllTests.js      # Master runner (npm test)
│   ├── utils/                  # generateToken.js
│   ├── validators/             # doctorValidator.js, appointmentValidator.js, clinicalValidator.js
│   ├── app.js                  # Express middleware, security headers & route mounting
│   ├── server.js               # Server bootstrap & graceful shutdown
│   └── package.json
│
├── database/
│   └── seed/
│       ├── seedAdmin.js        # Admin seeder
│       └── seedDoctors.js      # Sample doctors seeder
│
├── docs/
│   ├── ARCHITECTURE.md         # System Architecture & Auth Flow
│   ├── DOCTOR_MANAGEMENT.md    # Doctor Data Model & Schedule Specs
│   ├── APPOINTMENT_ENGINE.md   # Appointment Engine & Double-Booking Protection
│   ├── CLINICAL_WORKFLOW.md    # Doctor Clinical Workflow & Prescription Specs
│   ├── NOTIFICATIONS_AND_JOBS.md # Notifications & Background Scheduler Specs
│   ├── GOOGLE_CALENDAR_INTEGRATION.md # Google Calendar OAuth & Sync Specs
│   ├── LEAVE_AND_RELIABILITY.md # Doctor Leave & Conflict Reliability Specs
│   ├── MEDICATION_REMINDERS.md # Medication Reminder & Adherence Specs
│   └── TESTING_AND_SECURITY.md # Automated Testing & Security Audit Specs
├── .env.example
├── .gitignore
├── package.json
├── PROJECT_MEMORY.md
└── README.md
```

---

## 🛠️ Installation, Testing & Setup

```bash
# Install all dependencies:
npm run install:all

# Run backend automated test suites:
cd server && npm test

# Seed database:
npm run seed:admin
npm run seed:doctors

# Start servers:
npm run dev:server  # Port 5000
npm run dev:client  # Port 5173
```
