# Healthcare Appointment & Follow-up Manager (HealthPulse)

Healthcare Appointment & Follow-up Management System — **Phase 1: Foundation & Authentication** & **Phase 2: Doctor Management**.

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

---

## 📁 Directory Structure

```text
healthcare-appointment-manager/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, ProtectedRoute
│   │   │   └── doctor/         # DoctorCard, DoctorSearchBar, WorkingHoursForm, LeaveList
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── admin/          # ManageDoctors, CreateDoctor, EditDoctor, ManageDoctorLeave
│   │   │   ├── doctor/         # DoctorProfile
│   │   │   ├── patient/        # DoctorSearch, DoctorDetails
│   │   │   └── dashboard/      # Dashboards
│   │   ├── services/           # apiClient, authApi, doctorApi
│   │   ├── types/              # auth.ts, doctor.ts
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
│   ├── controllers/            # authController.js, doctorController.js
│   ├── middleware/             # authMiddleware.js, roleMiddleware.js, errorMiddleware.js
│   ├── models/                 # User.js, DoctorProfile.js
│   ├── routes/                 # authRoutes.js, doctorRoutes.js
│   ├── services/               # doctorService.js
│   ├── utils/                  # generateToken.js
│   ├── validators/             # doctorValidator.js
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
│   └── DOCTOR_MANAGEMENT.md    # Doctor Data Model & Schedule Specs
├── .env.example
├── .gitignore
├── package.json
├── PROJECT_MEMORY.md
└── README.md
```

---

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
# In the root directory:
npm run install:all
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Ensure your MongoDB instance is running, or provide your MongoDB connection string in `.env`.

---

## ⚡ Running & Seeding

### 1. Seed Database

```bash
# Seed Super Admin (admin@healthcare.com / AdminPassword123!)
npm run seed:admin

# Seed Demo Doctors (Cardiology, Neurology)
npm run seed:doctors
```

### 2. Start Servers

```bash
# Terminal 1 - Backend API (http://localhost:5000)
npm run dev:server

# Terminal 2 - React Frontend (http://localhost:5173)
npm run dev:client
```

---

## 🧪 Testing Phase 2 Doctor Workflows

### 1. Admin Doctor Management
- Log in as Admin (`admin@healthcare.com` / `AdminPassword123!`).
- Navigate to **Manage Doctors** via the Navbar or Dashboard.
- Click **Add New Doctor** to create a doctor with custom weekly hours and slot duration.
- Click **Edit** to modify specialization or hours; click **Leaves** to add/delete leave dates.

### 2. Patient Doctor Search
- Log in as a Patient (or register a new patient account).
- Click **Find Doctors** in the Navbar.
- Search by doctor name or filter by specialization.
- Click **View Profile & Schedule** to view working hours and upcoming leaves.

### 3. Doctor Self-Profile View
- Log in as a Doctor (e.g. `dr.sarah@healthcare.com` / `DoctorPassword123!`).
- Click **My Profile** in the Navbar.
- Inspect active consultation hours and registered leaves.
