# System Architecture — Phase 1: Foundation & Authentication

## 1. Overview

HealthPulse is a MERN-based Healthcare Appointment & Follow-up Management system. **Phase 1** establishes the core technical foundation: Express REST API, MongoDB data persistence with Mongoose, stateless JWT authentication, and strict Role-Based Access Control (RBAC).

```text
React Frontend (Vite + TS)
         │  (HTTP / JSON with Bearer JWT)
         ▼
Express REST API Server
    ├── CORS, Body Parser, Cookie Parser
    ├── Auth Middleware (JWT Verification)
    ├── Role Middleware (RBAC: PATIENT, DOCTOR, ADMIN)
    └── Centralized Error Handling
         │
         ▼
MongoDB Database (Mongoose ODM)
    └── Users Collection (Hashed passwords, unique emails, roles)
```

---

## 2. Role-Based Access Control (RBAC)

Phase 1 defines three distinct user roles:

| Role | Access Level | Creation Mechanism | Default Dashboard |
| :--- | :--- | :--- | :--- |
| **`PATIENT`** | Standard access to patient portal | Self-registration via `/api/auth/register` | `/patient/dashboard` |
| **`DOCTOR`** | Clinical consultation portal access | Provisioned via Admin flow *(Phase 2)* | `/doctor/dashboard` |
| **`ADMIN`** | System administrator | Database seed script `seedAdmin.js` | `/admin/dashboard` |

### Role Guard Rules
- Public registration (`POST /api/auth/register`) **strictly assigns `PATIENT` role**, rejecting or overriding any attempt to claim `ADMIN` or `DOCTOR`.
- Protected frontend routes evaluate `allowedRoles` and redirect unauthorized roles to their respective dashboards.
- Backend routes use `requireRole('PATIENT' | 'DOCTOR' | 'ADMIN')` to return `403 Forbidden` on role violations.

---

## 3. Authentication & JWT Flow

```text
[Client]                                  [Backend]                              [Database]
   │                                          │                                      │
   │─── 1. POST /api/auth/register / login ──>│                                      │
   │    { email, password, name }             │─── 2. Query User / Check Hash ──────>│
   │                                          │<── 3. Return User Record ────────────│
   │                                          │
   │                                          │─── 4. Generate JWT (id, role)
   │<── 5. Return 200 OK + JWT + User ────────│
   │
   │─── 6. GET /api/auth/me (Bearer JWT) ────>│
   │                                          │─── 7. Verify JWT Signature
   │                                          │─── 8. User.findById(id) ────────────>│
   │                                          │<── 9. Return User Document ──────────│
   │<── 10. Return Profile (Sanitized) ───────│
```

---

## 4. API Endpoints Reference

| Method | Endpoint | Access | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health probe | None | `{ success, message, timestamp }` |
| `POST` | `/api/auth/register` | Public | Register patient | `{ name, email, password }` | `{ success, message, token, user }` |
| `POST` | `/api/auth/login` | Public | Log in user | `{ email, password }` | `{ success, message, token, user }` |
| `GET` | `/api/auth/me` | Private | Current user profile | None (`Bearer <token>`) | `{ success, user }` |

---

## 5. Security Best Practices Implemented

1. **Password Hashing**: Bcrypt salt rounds = 10. Passwords are never stored or logged in plain text.
2. **Password Exclusion**: Mongoose schema `toJSON` transform automatically strips `password` and `__v` from all JSON responses.
3. **Privilege Escalation Prevention**: Registration handler hardcodes `role: 'PATIENT'` regardless of client payload.
4. **Token Expiration**: Configurable JWT expiration (default `7d`).
5. **Standardized Error Responses**: Centralized error middleware ensures predictable `{ success: false, message: ... }` responses without leaking stack traces in production.
