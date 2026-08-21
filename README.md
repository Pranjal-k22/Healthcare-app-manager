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
  > **Note**: Requires Ollama running locally with `ollama pull qwen2.5-coder:7b` (or `ollama pull qwen2.5:7b-instruct`) before AI features work.


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

# Local Ollama LLM Configuration (Phase 10)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
OLLAMA_TIMEOUT_MS=28000
LLM_MAX_ATTEMPTS=2
LLM_BACKOFF_BASE_MS=300
```

### 4. Database Seeders
```bash
# Seed initial Admin account (admin@healthcare.com / AdminPassword123!)
npm run seed:admin --prefix server

# Seed sample Doctors and working schedules
npm run seed:doctors --prefix server
```

### 5. Running the Application

Open 3 separate terminals to start the full system:

```bash
# Terminal 1: Start Local Ollama Daemon & Model
# Option A: Start daemon service
ollama serve

# Option B: Run model directly
ollama run qwen2.5-coder:7b
# (or if using llama3: ollama run llama3)

# Terminal 2: Start Backend Server (Port 5000)
npm run dev:server

# Terminal 3: Start Frontend Client (Port 5173)
npm run dev:client
```

Access the application in your browser at **`http://localhost:5173`**.

#### 🔑 Demo Accounts for Quick Login
- **Admin**: `admin@healthcare.com` / `AdminPassword123!`
- **Cardiologist**: `dr.jenkins@healthpulse.com` / `DoctorPassword123!`
- **Neurologist**: `dr.vance@healthpulse.com` / `DoctorPassword123!`
- **Patient**: Register a new account at `/register` or login with your patient credentials.


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

## 📅 Google Calendar OAuth Multi-User Integration

### 1. Architecture Overview
- **Per-User Authenticated Clients**: Rather than a single shared/global client instance, a fresh `google.auth.OAuth2` client is instantiated per request from the logged-in user's stored credentials.
- **AES-256-GCM Token Encryption at Rest**: `accessToken` and `refreshToken` are encrypted with an authenticated 32-byte key (`TOKEN_ENCRYPTION_KEY`) using `crypto.createCipheriv('aes-256-gcm', ...)` and are never stored in plaintext or exposed in API responses.
- **Signed State CSRF Protection**: `GET /api/auth/google/connect` issues a cryptographically signed JWT `state` containing the requesting `userId` and a high-entropy nonce (valid for 10 minutes, signed with `GOOGLE_OAUTH_STATE_SECRET`), ensuring safe identification upon Google callback without session leaks.
- **Automatic Token Refresh**: The OAuth client listens to the `tokens` event on every request, automatically persisting updated access tokens and newly issued refresh tokens directly back to MongoDB.
- **Graceful Failure**: If a user is not connected or their token was revoked externally, appointment booking, rescheduling, and cancellations continue uninterrupted while flipping connection status back to disconnected.

### 2. Endpoints
- `GET /api/auth/google/connect`: Generates consent URL with signed state and `prompt: consent`.
- `GET /api/auth/google/callback`: Public callback endpoint that verifies signed state, exchanges code for tokens, encrypts credentials, and redirects to `${FRONTEND_URL}/patient/appointments?calendar_connected=true`.
- `GET /api/patient/google-calendar/status`: Returns `{ connected: boolean, googleAccountEmail, connectedAt, calendarId }`.
- `POST /api/patient/google-calendar/disconnect`: Revokes token with Google and cleans up stored credentials.

### 3. Google Cloud Console Setup Steps
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project (e.g. `HealthPulse-Clinic`).
3. Enable the **Google Calendar API** and **Google People API** under **APIs & Services > Library**.
4. Configure the **OAuth Consent Screen** (User Type: External / Internal) and add scopes:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Go to **Credentials > Create Credentials > OAuth client ID** (Application type: Web application).
6. Set **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5000/api/calendar/oauth/callback`
7. Copy the generated **Client ID** and **Client Secret** into your `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   GOOGLE_OAUTH_STATE_SECRET=your_secure_state_secret
   TOKEN_ENCRYPTION_KEY=your_32_byte_aes_key_here
   FRONTEND_URL=http://localhost:5173
   ```

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

## 📧 Email Notifications Architecture (Nodemailer + Gmail SMTP)

### 1. Overview
- **Transport**: Uses Nodemailer configured with Gmail SMTP (`service: 'gmail'`) initialized as a singleton transporter with startup verification (`verifyTransporter`). Operates with a graceful in-development mock logger if credentials are not enabled.
- **Reliability & Audit Logging**: Every send attempt is recorded in the `NotificationLog` collection (`recipientEmail`, `notificationType`, `appointmentId`, `subject`, `payload`, `status: sent|failed|dead`, `attempts`, `nextRetryAt`, `lastError`).
- **Non-Blocking Safety**: Email delivery failures never throw into or block core booking, rescheduling, or cancellation transactions.
- **Automated Retry Worker**: Background job (`startEmailRetryJob`) runs every 10 minutes, querying failed notifications with exponential backoff (`2^attempts` minutes) up to `MAX_ATTEMPTS = 5` before marking them `dead`.

### 2. Supported Email Templates (`services/emailTemplates/`)
- **`bookingConfirmation`**: Sent to patient and doctor on appointment confirmation.
- **`appointmentReminder`**: Scheduled reminders sent 24h before and 1h before consultations.
- **`appointmentCancellation`**: Sent to patient and doctor on cancellation or slot reschedule.
- **`doctorLeaveConflict`**: Sent to affected patients when doctor leave conflicts with existing appointments, with direct reschedule CTAs.
- **`medicationReminder`**: Scheduled reminders for prescription medication doses.
- **`passwordChanged`**: Security alert sent when user credentials are updated.

### 3. Gmail App Password Setup Steps
Gmail blocks plain-password SMTP authentication. You must generate a dedicated **16-character App Password**:
1. Log into the Gmail account you want to send emails from (`GMAIL_USER`).
2. Navigate to [**Google Account Security**](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top, search for **"App passwords"** (or go to **2-Step Verification > App passwords**).
5. Enter an App Name (e.g. `HealthPulse App`) and click **Create**.
6. Google will generate a 16-character password (e.g. `abcd efgh ijkl mnop`).
7. Copy and paste it (without spaces) into your `.env`:
   ```env
   GMAIL_USER=your_address@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   EMAIL_FROM_NAME="HealthPulse Hospital"
   SUPPORT_EMAIL=your_address@gmail.com
   ENABLE_EMAIL_NOTIFICATIONS=true
   ```
> [!NOTE]
> Free Gmail accounts have a sending volume limit of roughly 500 emails/day (adequate for development and demonstration). For high-volume production deployments, swap Nodemailer's transport configuration to SendGrid, AWS SES, or Mailgun without changing any template or calling code.

### 4. Development Test Email Endpoint
Verify your SMTP credentials independently of appointment workflows using the dev-only endpoint:
```http
POST /api/dev/test-email
Content-Type: application/json

{
  "to": "your_email@gmail.com",
  "template": "bookingConfirmation"
}
```

---

## ⚠️ Known Limitations

1. **Hardware Requirements for Local LLM**: Running Ollama with 7B/8B models requires at least 8GB of system RAM.
2. **Google Calendar Configuration**: Requires creating an OAuth 2.0 Web Client ID in the Google Cloud Console.
3. **Gmail SMTP Volume Limits**: Gmail limits free sending to ~500 emails/day. Use SendGrid or Amazon SES for high-volume production scale.
4. **Payment Gateway**: The billing payment endpoint simulates successful settlement for development. Wire Stripe/PayPal API keys for live transactions.
5. **Avatar Storage**: Uses local static disk storage under `/uploads/avatars`. Wire AWS S3 or Cloudflare R2 for multi-instance deployments.



