# HealthPulse — Complete REST API Reference

All endpoints return JSON responses in the format:
`{ success: boolean, data?: any, message?: string }` or `{ success: false, error: string }`.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | None | Register new patient account |
| `POST` | `/api/auth/login` | Public | None | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | JWT | Any | Get currently authenticated user profile |

---

## 2. Doctor Management Endpoints (`/api/doctors`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Public | None | List doctors with filter by specialization / search |
| `GET` | `/api/doctors/:id` | Public | None | Get specific doctor public profile & working hours |
| `POST` | `/api/doctors` | JWT | `ADMIN` | Provision a new doctor account & profile |
| `PUT` | `/api/doctors/:id/schedule` | JWT | `DOCTOR`, `ADMIN` | Update working hours & slot duration |
| `POST` | `/api/doctors/:id/leaves` | JWT | `DOCTOR`, `ADMIN` | Add doctor leave dates |
| `DELETE` | `/api/doctors/:id/leaves/:leaveId` | JWT | `DOCTOR`, `ADMIN` | Remove doctor leave date |

---

## 3. Appointment Endpoints (`/api/appointments`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments/slots` | Public | None | Query available slots (`doctorId`, `date`) |
| `POST` | `/api/appointments` | JWT | `PATIENT` | Book a new slot with symptoms (Triggers pre-visit AI) |
| `GET` | `/api/appointments/my` | JWT | `PATIENT`, `DOCTOR` | Get user's appointment list |
| `GET` | `/api/appointments/:id` | JWT | `PATIENT`, `DOCTOR` | Get appointment details (Includes AI summaries) |
| `PUT` | `/api/appointments/:id/cancel` | JWT | `PATIENT`, `DOCTOR`, `ADMIN` | Cancel appointment & trigger calendar event deletion |
| `PUT` | `/api/appointments/:id/reschedule` | JWT | `PATIENT`, `DOCTOR` | Reschedule appointment to new date/time |

---

## 4. Clinical Workflow Endpoints (`/api/clinical`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/clinical/consultation` | JWT | `DOCTOR` | Complete consultation: record clinical notes & structured prescriptions (Triggers post-visit AI) |
| `GET` | `/api/clinical/appointment/:appointmentId` | JWT | `PATIENT`, `DOCTOR` | Get clinical record & prescription for an appointment |

---

## 5. Doctor Leave Management Endpoints (`/api/leaves`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | JWT | `DOCTOR`, `ADMIN` | Request / create date range leave with conflict checks |
| `GET` | `/api/leaves` | JWT | `DOCTOR`, `ADMIN` | List leave requests |
| `PUT` | `/api/leaves/:id/status` | JWT | `ADMIN` | Approve or reject leave request |
| `DELETE` | `/api/leaves/:id` | JWT | `DOCTOR`, `ADMIN` | Cancel leave record |

---

## 6. Notification Endpoints (`/api/notifications`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | JWT | Any | Get user's in-app notifications |
| `PUT` | `/api/notifications/:id/read` | JWT | Any | Mark specific notification as read |
| `PUT` | `/api/notifications/read-all` | JWT | Any | Mark all user notifications as read |

---

## 7. Medication Reminder Endpoints (`/api/medications`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/medications/reminders` | JWT | `PATIENT` | Get patient's medication schedule and doses |
| `PUT` | `/api/medications/reminders/:id/status`| JWT | `PATIENT` | Mark dose status as `TAKEN` or `SKIPPED` |

---

## 8. Google Calendar OAuth Endpoints (`/api/calendar`)

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/calendar/auth` | Public | None | Direct browser redirect to Google OAuth login |
| `GET` | `/api/calendar/oauth/url` | JWT | Any | Returns `{ authUrl }` for in-app connect button |
| `GET` | `/api/calendar/oauth/callback` | Public | None | Google OAuth authorization callback |
| `GET` | `/api/calendar/auth/callback` | Public | None | Google OAuth callback alias |
| `GET` | `/api/calendar/status` | JWT | Any | Check Google Calendar connection status |
| `POST` | `/api/calendar/disconnect` | JWT | Any | Disconnect Google Calendar integration |
| `POST` | `/api/calendar/sync/:appointmentId` | JWT | Any | Trigger manual sync for an appointment |
