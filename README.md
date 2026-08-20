# Healthcare Appointment & Follow-up Manager (Phase 1)

Healthcare Appointment & Follow-up Management System — **Phase 1: Foundation & Authentication**.

---

## 🚀 Phase 1 Features

- ✅ **Backend API**: Node.js & Express REST API architecture with modular routers and controllers.
- ✅ **Database**: MongoDB integration using Mongoose with schema validation and pre-save password hashing.
- ✅ **Authentication**: Stateless JSON Web Token (JWT) issuing, Bearer token verification middleware.
- ✅ **Role-Based Access Control (RBAC)**: Support for `PATIENT`, `DOCTOR`, and `ADMIN` roles.
- ✅ **Seed Utility**: Dedicated database seeder for initializing the super administrator account (`seedAdmin.js`).
- ✅ **Frontend SPA**: React 18 + TypeScript + Vite with React Router v6.
- ✅ **Design System**: Responsive glassmorphic dark theme styled with custom CSS design tokens.
- ✅ **Session Persistence**: Automatic token hydration and validation via `/api/auth/me`.

---

## 📁 Directory Structure

```text
healthcare-appointment-manager/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/common/  # Navbar, ProtectedRoute
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth
│   │   ├── pages/              # Login, Register, Dashboards
│   │   ├── services/           # apiClient, authApi
│   │   ├── types/              # TypeScript definitions
│   │   ├── utils/              # Constants
│   │   ├── App.tsx             # Routing & Layout
│   │   ├── main.tsx            # Entrypoint
│   │   └── index.css           # Global Theme & Design Tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Express REST API
│   ├── config/                 # db.js, env.js
│   ├── controllers/            # authController.js
│   ├── middleware/             # authMiddleware.js, roleMiddleware.js, errorMiddleware.js
│   ├── models/                 # User.js
│   ├── routes/                 # authRoutes.js
│   ├── utils/                  # generateToken.js
│   ├── app.js                  # Express middleware & route setup
│   ├── server.js               # Server bootstrap & DB connection
│   └── package.json
│
├── database/
│   └── seed/
│       └── seedAdmin.js        # Initial Admin seeding script
│
├── docs/
│   └── ARCHITECTURE.md         # System Architecture & Auth Flow
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### 1. Install Dependencies

In the root directory, run:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or individually:

```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure your MongoDB instance is running, or provide your MongoDB Atlas connection URI:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_appointment_db
JWT_SECRET=super_secret_healthcare_jwt_key_phase1_2026_change_in_production
CLIENT_URL=http://localhost:5173
```

---

## ⚡ Running the Application

### 1. Seed the Initial Admin User

```bash
npm run seed:admin
```

> **Default Admin Credentials**:
> - **Email**: `admin@healthcare.com`
> - **Password**: `AdminPassword123!`

### 2. Start the Backend API

```bash
npm run dev:server
```
Backend runs at `http://localhost:5000`.

### 3. Start the Frontend Application

In a separate terminal:

```bash
npm run dev:client
```
Frontend runs at `http://localhost:5173`.

---

## 🧪 Testing Authentication & Roles

### 1. Registration (`PATIENT`)
- Navigate to `http://localhost:5173/register`
- Register a patient (e.g. Name: *John Doe*, Email: *john@example.com*, Password: *password123*)
- Automatically redirected to `/patient/dashboard`

### 2. Login (`ADMIN`)
- Navigate to `http://localhost:5173/login`
- Use the quick autofill button or enter `admin@healthcare.com` / `AdminPassword123!`
- Automatically redirected to `/admin/dashboard`

### 3. Protected Route Verification
- Try navigating manually to `/admin/dashboard` while logged in as a `PATIENT`
- The `ProtectedRoute` guard detects role mismatch and redirects you to `/patient/dashboard`
- Refreshing the page keeps your active session via `/api/auth/me` and `AuthContext`
