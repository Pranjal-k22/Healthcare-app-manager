# HealthPulse — Deployment & Production Guide

## 1. Production Architecture Overview

```text
                           INTERNET USERS
                                 │
                                 ▼
                     React Frontend (Static CDN)
                     (Vercel / Netlify / S3)
                                 │
                                 ▼ HTTPS / REST API
                     Node.js / Express Backend
                     (Render / AWS ECS / Railway)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
MongoDB Atlas          Background Cron Jobs       Dedicated Inference
(Database Tier)       (Reminders & Adherence)    (Local / Self-Hosted Ollama)
        │                        │                        │
        │                        ▼                        │
        │                 Email Provider                  │
        │            (Nodemailer + Gmail SMTP)            │
        │                                                 │
        └──────────────── Google Calendar ────────────────┘
                      (Google Cloud OAuth 2.0)
```

---

## 2. Deployment Strategies

### Frontend (Client)
- **Framework**: Vite + React 18 + TypeScript.
- **Build Command**: `npm run build --prefix client` (generates static assets in `client/dist`).
- **Recommended Host**: Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.
- **Environment Variable**: `VITE_API_URL=https://api.yourdomain.com/api`.

### Backend (Server)
- **Runtime**: Node.js v18+.
- **Start Command**: `npm start --prefix server` (executes `node server.js`).
- **Recommended Host**: Render, Railway, AWS Elastic Beanstalk, or Docker on DigitalOcean / AWS EC2.
- **Health Check URL**: `GET https://api.yourdomain.com/api/health`.

### Local LLM Deployment (Ollama)
- **Important**: Shared standard serverless functions (like AWS Lambda or Vercel Functions) cannot run 7B/8B parameter models.
- **Option A (Demonstration/Staging)**: Run Ollama on the local host or a staging virtual machine (`ollama serve`).
- **Option B (Production Private Inference)**: Deploy Ollama on a dedicated GPU/high-RAM compute instance (e.g. AWS EC2 `g4dn.xlarge` or Hetzner GPU server) and set `OLLAMA_HOST=http://private-ai-instance:11434` in backend `.env`.

---

## 3. Production Environment Checklist

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/healthpulse` |
| `JWT_SECRET` | 64+ char cryptographic key | *(Generate via `openssl rand -hex 32`)* |
| `CLIENT_URL` | Deployed Frontend URL | `https://healthpulse.yourdomain.com` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID | `512072860662-...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | Production Callback URL | `https://api.yourdomain.com/api/calendar/oauth/callback` |
| `ENABLE_EMAIL_NOTIFICATIONS`| Enable real SMTP delivery | `true` |
| `GMAIL_USER` | Gmail address for SMTP | `your_address@gmail.com` |
| `GMAIL_APP_PASSWORD` | Google App Password (16 chars) | `xxxx xxxx xxxx xxxx` |
| `EMAIL_FROM_NAME` | Sender display name | `"HealthPulse Hospital"` |
| `SUPPORT_EMAIL` | Contact & support email | `support@yourdomain.com` |
| `LLM_MODE` | Dual-engine or local-only | `dual` |
| `OLLAMA_HOST` | Ollama daemon address | `http://localhost:11434` |
| `OLLAMA_MODEL` | Local LLM model tag | `llama3` / `qwen2.5-coder:7b` |
| `GEMINI_API_KEY` | Google Gemini API key (dual mode) | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini cloud model | `gemini-1.5-flash` |

> ℹ️ **Email Service Requirement**: HealthPulse satisfies the assignment's email notification requirement using **Nodemailer with Gmail SMTP** (over STARTTLS Port 587 with forced IPv4 socket resolution to ensure high reliability on cloud hosts like Render). A 16-character Google App Password (generated via Google Account Security) is required for live delivery; when disabled or unconfigured, the service operates seamlessly in mock logging mode.

---

## 4. Verification & Health Monitoring

1. Check Backend Health:
   ```bash
   curl -I https://api.yourdomain.com/api/health
   ```
2. Verify Database Connection:
   Server logs should report: `[MongoDB] Connected successfully`.
3. Verify Background Schedulers:
   Server logs should report: `[ReminderJob] Starting background reminder job` and `[MedicationJob] Starting background medication reminder worker`.
