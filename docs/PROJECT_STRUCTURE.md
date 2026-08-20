# HealthPulse — Project Directory Structure (Phase 11)

This document reflects the actual repository structure of the **HealthPulse** Healthcare Appointment & Follow-up Management platform.

```text
healthcare-appointment-manager/
├── .env.example                     # Environment template (Zero secrets)
├── .gitignore                       # Git ignore definitions (.env, node_modules, dist)
├── package.json                     # Root project orchestration scripts
├── detail.md                        # Blueprint, feature matrix & architectural design write-up
├── PROJECT_MEMORY.md                # Living source of truth & roadmap status
├── README.md                        # Master production documentation & quick start
│
├── client/                          # Frontend Application (React 18 + Vite + TypeScript)
│   ├── index.html                   # HTML entry point with modern typography
│   ├── package.json                 # Frontend dependencies (React Router, Axios, Lucide)
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── vite.config.ts               # Vite bundler & dev proxy configuration
│   ├── src/
│   │   ├── main.tsx                 # React DOM mount point
│   │   ├── App.tsx                  # Root application router with protected routes
│   │   ├── index.css                # CSS design system (Dark theme, glassmorphism, tokens)
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global JWT authentication and user session state
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Sidebar, ProtectedRoute, Alert, Badge, Card, Modal
│   │   │   ├── appointment/         # SlotPicker, AppointmentCard, StatusBadge
│   │   │   ├── clinical/            # PrescriptionForm, ClinicalNotesEditor, MedicineTable
│   │   │   ├── doctor/              # WorkingHoursForm, LeaveRequestModal, DoctorCard
│   │   │   └── reminder/            # MedicationReminderList, AdherenceTracker
│   │   ├── pages/
│   │   │   ├── auth/                # Login.tsx, Register.tsx
│   │   │   ├── patient/             # PatientDashboard.tsx, BookAppointment.tsx, AppointmentDetails.tsx
│   │   │   ├── doctor/              # DoctorDashboard.tsx, DoctorConsultation.tsx, DoctorSchedule.tsx
│   │   │   └── admin/               # AdminDashboard.tsx, DoctorManagement.tsx, LeaveManagement.tsx
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance with JWT Bearer interceptor
│   │   │   ├── authService.ts       # Authentication API calls
│   │   │   ├── appointmentService.ts# Slot query & booking API calls
│   │   │   ├── doctorService.ts     # Doctor directory & schedule API calls
│   │   │   ├── clinicalService.ts   # Clinical records & prescription API calls
│   │   │   ├── reminderService.ts   # Medication adherence API calls
│   │   │   └── calendarService.ts   # Google Calendar OAuth API calls
│   │   └── types/                   # TypeScript interface definitions (User, Appointment, Clinical, etc.)
│
├── server/                          # Backend Application (Node.js + Express.js + Mongoose)
│   ├── server.js                    # Server entry point, DB connection & cron bootloader
│   ├── app.js                       # Express app configuration, Helmet, CORS & route registry
│   ├── package.json                 # Backend dependencies (express, mongoose, nodemailer, etc.)
│   ├── config/
│   │   ├── db.js                    # MongoDB Mongoose connection handler
│   │   └── env.js                   # Validated environment variables loader
│   ├── models/
│   │   ├── User.js                  # User credentials, bcrypt hashing & RBAC roles
│   │   ├── DoctorProfile.js         # Working hours, slot durations, specialization
│   │   ├── Appointment.js           # Slot bookings, symptoms, pre-visit summary, calendar sync
│   │   ├── ClinicalRecord.js        # Clinical findings, post-visit AI summary
│   │   ├── Prescription.js          # Structured medicines, dosage, frequency, instructions
│   │   ├── DoctorLeave.js           # Date range leaves with 409 conflict detection
│   │   ├── Notification.js          # In-app alerts & transactional email dispatch records
│   │   ├── CalendarConnection.js    # Google OAuth tokens with encrypted redaction
│   │   └── MedicationReminder.js    # Dose schedule with compound idempotency index
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Current User
│   │   ├── doctorController.js      # Doctor CRUD, schedules & working hours
│   │   ├── appointmentController.js # Slots, booking, cancel, reschedule
│   │   ├── clinicalController.js    # Consultation notes & prescription completion
│   │   ├── leaveController.js       # Doctor leave management & conflict checking
│   │   ├── notificationController.js# In-app notification retrieval & mark-as-read
│   │   ├── medicationController.js  # Patient dose schedule & adherence logging
│   │   └── calendarController.js    # Google OAuth URL, callback & manual sync
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth
│   │   ├── doctorRoutes.js          # /api/doctors
│   │   ├── appointmentRoutes.js     # /api/appointments
│   │   ├── clinicalRoutes.js        # /api/clinical
│   │   ├── leaveRoutes.js           # /api/leaves
│   │   ├── notificationRoutes.js    # /api/notifications
│   │   ├── medicationRoutes.js      # /api/medications
│   │   └── calendarRoutes.js        # /api/calendar
│   ├── services/
│   │   ├── appointmentService.js    # Slot generator, double-booking guard & AI trigger
│   │   ├── clinicalService.js       # Consultation completion & post-visit AI trigger
│   │   ├── email/
│   │   │   ├── emailService.js      # Nodemailer transport with 3-attempt backoff
│   │   │   └── emailTemplates.js    # HTML & plain-text transactional email builders
│   │   ├── google/
│   │   │   └── googleCalendarService.js # OAuth2 client & non-blocking event sync
│   │   ├── llm/
│   │   │   ├── llmService.js        # Orchestrator with 2-attempt bounded retry
│   │   │   ├── ollamaProvider.js    # Local Ollama HTTP client with timeout
│   │   │   ├── prompts.js           # Verbatim prompts & injection defenses
│   │   │   ├── schemas.js           # Schemas, urgency enum & version constants
│   │   │   ├── validator.js         # JSON validator & medication presence checker
│   │   │   └── llmErrors.js         # Custom error taxonomy hierarchy
│   │   └── reminder/
│   │       └── reminderScheduler.js # Frequency-to-dose parser & schedule builder
│   ├── jobs/
│   │   ├── reminderJob.js           # 60s cron checking upcoming appointments
│   │   └── medicationReminderJob.js # 60s cron checking active medicine doses
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT token verification & user attachment
│   │   ├── roleMiddleware.js        # RBAC endpoint gatekeeper (requireRole)
│   │   └── errorHandler.js          # Centralized error handler with production sanitization
│   ├── seeders/
│   │   ├── seedAdmin.js             # Idempotent admin account seeder
│   │   └── seedDoctors.js           # Initial doctor profiles & working hours seeder
│   └── tests/
│       ├── runAllTests.js           # Master test runner (10 test suites)
│       ├── auth.test.js             # Suite 1: Authentication & security
│       ├── appointment.test.js      # Suite 2: Double-booking & slot validation
│       ├── clinical.test.js         # Suite 3: Clinical records & prescriptions
│       ├── leave.test.js            # Suite 4: Doctor leave & conflict detection
│       ├── notification.test.js     # Suite 5: In-app & email notifications
│       ├── calendar.test.js         # Suite 6: Google Calendar OAuth & sync
│       ├── medication.test.js       # Suite 7: Medication reminders & adherence
│       ├── security.test.js         # Suite 8: IDOR & error sanitization
│       ├── e2e.test.js              # Suite 9: End-to-end full clinic workflow
│       └── llm.test.js              # Suite 10: Local LLM validation & guardrails
│
└── docs/                            # Comprehensive System Documentation
    ├── ARCHITECTURE.md              # System architecture, data flow & diagrams
    ├── PROJECT_STRUCTURE.md         # Repository tree & file responsibilities
    ├── DATABASE_SCHEMA.md           # Master schema, models, indexes & relations
    ├── API.md                       # Complete REST API reference
    ├── LOCAL_LLM_SETUP.md           # Local Ollama installation & configuration
    ├── LLM_ARCHITECTURE.md          # AI safety guardrails, schemas & data isolation
    ├── LLM_PROMPTS.md               # Prompt engineering & injection defenses
    ├── TESTING_AND_SECURITY.md      # Test coverage & security hardening details
    ├── FINAL_TEST_REPORT.md         # 10 test suites & 10 evaluation scenarios
    ├── EVALUATION_MATRIX.md         # Rubric mapping criteria to codebase
    ├── DEMO_GUIDE.md                # Step-by-step evaluator presentation guide
    ├── PRESENTATION_POINTS.md       # Architecture presentation & pitch notes
    ├── SECURITY.md                  # Comprehensive security & privacy review
    └── FILE_INVENTORY.md            # File-by-file purpose inventory
```
