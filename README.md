# HealthPulse — Healthcare Appointment & Follow-up Manager

HealthPulse is an enterprise-grade full-stack MERN clinic management and patient follow-up platform featuring local Ollama LLM clinical assistance, concurrency-controlled appointment scheduling, resilient background notifications, Google Calendar synchronization, and automated medication adherence tracking.

---

## 🌟 Key Features

- **Stateless RBAC Authentication (Phase 1)**: JWT-based authentication for Patients, Doctors, and Administrators with bcrypt password hashing.
- **Doctor Schedule Management (Phase 2)**: Dynamic weekly working hours and configurable slot durations (15–60 mins).
- **Concurrency-Safe Appointment Engine (Phase 3)**: Atomic double-booking prevention using MongoDB compound partial unique indexes.
- **Clinical Consultation Workflow (Phase 4)**: Doctor consultation room with diagnostic findings, clinical notes, and structured prescriptions.
- **Resilient Background Notifications (Phase 5)**: Nodemailer email delivery with 3-attempt exponential backoff and 60-second appointment reminder worker.
- **Google Calendar Integration (Phase 6)**: OAuth 2.0 calendar synchronization with offline token refresh and token redaction.
- **Doctor Leave Conflict Protection (Phase 7)**: 409 Conflict detection and automatic slot blocking during approved leaves.
- **Medication Reminders & Adherence (Phase 8)**: Deterministic frequency/duration parser and scheduled dose tracking.
- **Security Hardening (Phase 9)**: Helmet HTTP headers, express rate limiting, payload size limits, and IDOR protection.
- **Privacy-Preserving Local LLM (Phase 10)**: On-device Ollama LLM integration (`llama3`/`qwen2.5`) generating pre-visit clinical summaries and post-visit patient guidance with zero-hallucination guardrails.
- **Production Documentation & Verification (Phase 11)**: Comprehensive documentation, 10 passing automated test suites, and clean production builds.

---

## 🏗️ Architecture Overview

```text
React 18 + Vite (Client) ➔ Express REST API (Backend) ➔ MongoDB (Source of Truth)
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
Background Cron Workers    LLM Service Layer     Google Calendar & Email
 (Reminders & Adherence)    (Ollama / Llama3)       (OAuth2 & Nodemailer)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18+`
- **MongoDB**: Running locally at `mongodb://localhost:27017`
- **Ollama**: Installed from [ollama.com](https://ollama.com)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Pranjal-k22/Healthcare-app-manager.git
cd Healthcare-app-manager

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_appointment_db
JWT_SECRET=super_secret_healthcare_jwt_key_phase1_2026_change_in_production
CLIENT_URL=http://localhost:5173
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 4. Database Seeders
```bash
# Seed initial Admin account (admin@healthcare.com / AdminPassword123!)
npm run seed:admin --prefix server

# Seed sample Doctors and working schedules
npm run seed:doctors --prefix server
```

### 5. Running the Application
```bash
# Start Ollama (in a separate terminal)
ollama run llama3

# Start Backend Server (Port 5000)
npm run dev:server

# Start Frontend Client (Port 5173)
npm run dev:client
```

---

## 🧪 Automated Testing

Run the full automated test suite (10 test suites covering all phases):
```bash
npm test --prefix server
```

---

## 📚 System Documentation

Complete architectural documentation is available in the [`docs/`](docs/) directory:
- [**System Architecture**](docs/ARCHITECTURE.md)
- [**Project Directory Structure**](docs/PROJECT_STRUCTURE.md)
- [**Database Schemas & Models**](docs/DATABASE_SCHEMA.md)
- [**REST API Reference**](docs/API.md)
- [**Local LLM Setup & Operations**](docs/LOCAL_LLM_SETUP.md)
- [**LLM Architecture & Safety**](docs/LLM_ARCHITECTURE.md)
- [**Prompt Engineering & Schemas**](docs/LLM_PROMPTS.md)
- [**Security & Privacy Guide**](docs/SECURITY.md)
- [**Final Test Report**](docs/FINAL_TEST_REPORT.md)
- [**Evaluation Matrix**](docs/EVALUATION_MATRIX.md)
- [**Live Demo Guide**](docs/DEMO_GUIDE.md)
- [**File Inventory**](docs/FILE_INVENTORY.md)

---

## 💳 Profile, Billing & Prescriptions Architecture

### 1. Patient Profile Management
- `GET /api/patient/profile`: Scoped strictly to authenticated `req.user.id`.
- `PUT /api/patient/profile`: Demographics, contact info, address, and emergency contacts. Validated via `zod`/validators. Immutable fields (`email`, `role`) are protected against modification.
- `POST /api/patient/profile/change-password`: Verifies `currentPassword` with bcrypt and increments `tokenVersion` to invalidate active sessions. Rate-limited to prevent brute-force attacks.
- `POST /api/patient/profile/avatar`: Multipart avatar upload (`multer`) with mime-type (JPEG/PNG/WEBP) and size (≤2MB) validation. Stored in `server/uploads/avatars/` (*Note: In production environments, replace local disk storage with Amazon S3 or Google Cloud Storage*).

### 2. Billing & Invoices Subsystem
- **Model**: `Invoice` (`invoiceNumber`, `appointmentId`, `patientId`, `doctorId`, `lineItems`, `subtotal`, `tax`, `total`, `status: pending|paid|overdue`, `paymentMethod`, `paidAt`).
- **Auto-Generation**: Completed appointments automatically generate an itemized invoice based on the doctor's consultation fee.
- **Endpoints**:
  - `GET /api/patient/billing/summary`: Returns `{ totalBilled, outstandingBalance, lastPaymentDate }`.
  - `GET /api/patient/billing`: Filterable by status (`pending`, `paid`, `overdue`) and date range.
  - `GET /api/patient/billing/:id`: Single invoice detail scoped to `req.user.id`.
  - `POST /api/patient/billing/:id/pay`: Settles invoice with payment method. (*Note: Uses simulated instant electronic payment processing for MVP. In production, connect Stripe PaymentIntents/Webhooks*).
- **Overdue Status Job**: Daily background scheduler that marks pending invoices as `overdue` when `dueDate < now()`.

### 3. Prescriptions Subsystem
- **Model**: `Prescription` with `status: 'active' | 'completed' | 'expired'` and `durationDays`.
- **Endpoints**:
  - `GET /api/patient/prescriptions`: Filterable by status and free-text search across doctor and medication names.
  - `GET /api/patient/prescriptions/:id`: Detailed clinical view with doctor credentials, medication table, physician notes, and post-visit summaries.
- **Status Job**: Daily background scheduler that automatically transitions active prescriptions to `completed` once their duration has elapsed.

### 4. Clean Document Printing
- Accessible via frontend `Print` buttons. Uses `@media print` CSS and `.print-area` / `.print-hidden` wrappers to strip all navigation chrome and output clean, bordered medical documents with hospital headers and verification footers.

---

## ⚠️ Known Limitations

1. **Hardware Requirements for Local LLM**: Running Ollama with 7B/8B models requires at least 8GB of system RAM.
2. **Google Calendar Configuration**: Requires creating an OAuth 2.0 Web Client ID in the Google Cloud Console.
3. **Email Delivery Mode**: Operates in development (mock console log) mode unless `ENABLE_EMAIL_NOTIFICATIONS=true` and SMTP credentials are provided.
4. **Payment Gateway**: The billing payment endpoint simulates successful settlement for development. Wire Stripe/PayPal API keys for live transactions.
5. **Avatar Storage**: Uses local static disk storage under `/uploads/avatars`. Wire AWS S3 or Cloudflare R2 for multi-instance deployments.

