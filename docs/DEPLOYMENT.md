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
        │             (SendGrid / AWS SES)                │
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
| `SMTP_HOST` | Production SMTP Host | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP Port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | SMTP Username | `apikey` |
| `SMTP_PASS` | SMTP Secret | `SG.xxxxxxxx...` |
| `EMAIL_FROM` | Sender address | `"HealthPulse <notifications@yourdomain.com>"` |
| `OLLAMA_HOST` | Ollama daemon address | `http://localhost:11434` |
| `OLLAMA_MODEL` | Local LLM model tag | `llama3` |

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
