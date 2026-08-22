# HealthPulse — Security Architecture & Hardening Guide

## 1. Authentication & Session Management
- **Password Hashing**: Bcryptjs with 10 salt rounds.
- **JWT Authorization**: Cryptographically signed tokens (`HS256`) carrying user ID and role claims, validated via `authMiddleware.js`.
- **Credential Stripping**: Password hashes and internal Mongoose fields (`__v`) are automatically stripped from all JSON responses via schema-level `toJSON` transforms.

## 2. Role-Based Access Control (RBAC) & IDOR Protection
- **Role Gatekeeping**: `requireRole(...roles)` middleware blocks unauthorized API mutations.
- **Ownership Verification**: All appointment, clinical record, and prescription routes perform explicit backend ownership checks (`req.user._id === resource.patientId / doctorId`).

## 3. Network & Transport Security
- **Helmet Headers**: Configured in `server/app.js` to enforce `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security`.
- **CORS Protection**: Origin whitelisting restricted to configured `CLIENT_URL`.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks on `/api/auth` (100 requests per 15 minutes).
- **Payload Size Limits**: Strict `1mb` JSON body limits on `express.json()`.

## 4. Protected Health Information (PHI) & AI Privacy
- **Hybrid Dual-Engine AI Architecture**: HealthPulse operates an intelligent dual-engine architecture combining On-Device Local AI (Ollama) with Google Gemini Cloud AI running simultaneously in parallel.
  - In `LLM_MODE=dual` (default), patient symptoms and doctor clinical observations are processed concurrently by local Ollama and Google Gemini API for redundant verification and cross-checking.
  - In `LLM_MODE=local-only`, external cloud API transmission is completely disabled and only on-device local Ollama inference executes.
- **Log Sanitization**: Sensitive medical text, passwords, and tokens are omitted from server log outputs.
- **Calendar Redaction**: Calendar sync credentials (`accessToken`, `refreshToken`) are never returned in plain text to the frontend.
