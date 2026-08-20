# Healthcare Appointment & Follow-up Manager (HealthPulse)

Healthcare Appointment & Follow-up Management System — **Phase 1: Foundation & Authentication**, **Phase 2: Doctor Management**, and **Phase 3: Appointment Engine**.

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

---

## 📁 Directory Structure

```text
healthcare-appointment-manager/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, ProtectedRoute
│   │   │   ├── doctor/         # DoctorCard, DoctorSearchBar, WorkingHoursForm, LeaveList
│   │   │   └── appointment/    # SlotPicker, AppointmentCard, AppointmentStatusBadge, RescheduleModal, CancelAppointmentModal
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── admin/          # ManageDoctors, CreateDoctor, EditDoctor, ManageDoctorLeave, ManageAppointments
│   │   │   ├── doctor/         # DoctorProfile, DoctorAppointments
│   │   │   ├── patient/        # DoctorSearch, DoctorDetails, BookAppointment, MyAppointments
│   │   │   └── dashboard/      # Dashboards
│   │   ├── services/           # apiClient, authApi, doctorApi, appointmentApi
│   │   ├── types/              # auth.ts, doctor.ts, appointment.ts
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
│   ├── controllers/            # authController.js, doctorController.js, appointmentController.js
│   ├── middleware/             # authMiddleware.js, roleMiddleware.js, errorMiddleware.js
│   ├── models/                 # User.js, DoctorProfile.js, Appointment.js
│   ├── routes/                 # authRoutes.js, doctorRoutes.js, appointmentRoutes.js
│   ├── services/               # doctorService.js, slotService.js, appointmentService.js
│   ├── utils/                  # generateToken.js
│   ├── validators/             # doctorValidator.js, appointmentValidator.js
│   ├── app.js                  # Express middleware & route mounting
│   ├── server.js               # Server bootstrap & DB connection
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
│   └── APPOINTMENT_ENGINE.md   # Appointment Engine & Double-Booking Protection
├── .env.example
├── .gitignore
├── package.json
├── PROJECT_MEMORY.md
└── README.md
```

---

## 🛠️ Installation & Setup

```bash
# Install all dependencies:
npm run install:all

# Seed database:
npm run seed:admin
npm run seed:doctors

# Start servers:
npm run dev:server  # Port 5000
npm run dev:client  # Port 5173
```

---

## 🧪 Testing Phase 3 Appointment Workflows

### 1. Patient Booking & Slot Generation
- Log in as Patient (or register).
- Click **Find Doctors** ➔ Select doctor ➔ Click **Book Appointment**.
- Choose a date (e.g. tomorrow) ➔ Select an available slot ➔ Click **Confirm & Book Appointment**.
- Receive appointment confirmation and view entry in **My Appointments**.

### 2. Double-Booking Prevention
- If two patients attempt to book the same doctor, date, and start time, MongoDB's partial unique index blocks the second write, returning a clean `409 Conflict` error without race conditions.

### 3. Patient Reschedule & Cancellation
- On **My Appointments**, click **Reschedule** on an upcoming booking.
- Pick a new date/slot ➔ Confirm reschedule (old appointment is cancelled, new slot is booked).
- Click **Cancel** on a booking to release the slot back to the doctor's available pool.

### 4. Doctor Queue & Completion
- Log in as Doctor (`dr.sarah@healthcare.com` / `DoctorPassword123!`).
- Navigate to **Appointments** in the Navbar.
- Review Today's queue and click **Mark Completed** when the consultation ends.
