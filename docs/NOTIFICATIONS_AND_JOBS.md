# Notifications & Background Jobs Specification (Phase 5)

## 1. Overview & Architecture

Phase 5 establishes the **Notification and Background Jobs Engine** for HealthPulse. It delivers persistent in-app notifications and transactional emails for all appointment lifecycle events while guaranteeing non-blocking asynchronous execution and fault isolation.

```text
                  Appointment Lifecycle Event
        (Booked / Cancelled / Rescheduled / Prescription / Reminder)
                               │
                               ▼
                    Database Commit Success
                               │
                               ▼
             Asynchronous Event Dispatcher
              [notificationService.js]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   In-App Notification                      Email Service
   (Notification Model)                    (Nodemailer)
            │                                     │
            ▼                                     ▼
Persistent MongoDB Record                   SMTP Delivery
  (Indexed by userId)                 (Retry loop: max 3 attempts)
```

---

## 2. Notification Model

```javascript
// server/models/Notification.js
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'APPOINTMENT_BOOKED',
      'APPOINTMENT_CONFIRMED',
      'APPOINTMENT_CANCELLED',
      'APPOINTMENT_RESCHEDULED',
      'APPOINTMENT_REMINDER',
      'PRESCRIPTION_AVAILABLE'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 150
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  relatedAppointmentId: {
    type: ObjectId,
    ref: 'Appointment',
    default: null,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: Mixed,
    default: {}
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Asynchronous Non-Blocking Execution & Fault Tolerance

1. **Transaction Independence**: All notification creation and email transmissions occur **strictly after** the primary database operations (such as appointment creation, cancellation, or rescheduling) are successfully committed.
2. **Failure Isolation**: If an SMTP server is unreachable, credentials fail, or network connectivity drops, the error is safely trapped and logged. The underlying appointment is **never** rolled back.
3. **Server Crash Immunity**: All dispatchers are wrapped in robust `try / catch` blocks so background worker exceptions can never crash the Express process.

---

## 4. Background Reminder Scheduler

- **File**: `server/services/jobs/reminderJob.js`
- **Cadence**: Runs periodically every 60 seconds (`REMINDER_JOB_INTERVAL_MS`).
- **Target Window**: Scans for active `BOOKED` appointments scheduled for today whose start time is within the reminder window (`APPOINTMENT_REMINDER_MINUTES`, default 60 mins).
- **Duplicate Prevention**: Before sending, the scheduler checks if an `APPOINTMENT_REMINDER` record already exists for `relatedAppointmentId` in the `Notification` collection. If already notified, it is skipped.
- **Graceful Lifecycle**: Guarded against duplicate timers on startup and safely cleared on `SIGINT` / `SIGTERM` signals.

---

## 5. Email Service & Retry Policy

- **File**: `server/services/email/emailService.js`
- **Transport**: `nodemailer` configured via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`).
- **Development Fallback**: When `ENABLE_EMAIL_NOTIFICATIONS` is false or SMTP credentials are unconfigured, delivery notices are logged in mock mode without throwing exceptions.
- **Retry Strategy**: Failed email attempts automatically retry up to 3 times with exponential backoff delays (300ms, 600ms).

---

## 6. API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private (All Roles) | Get user's notifications (paginated) |
| `GET` | `/api/notifications/unread-count` | Private (All Roles) | Get count of unread notifications |
| `PATCH` | `/api/notifications/:id/read` | Private (All Roles) | Mark specific notification as read |
| `PATCH` | `/api/notifications/read-all` | Private (All Roles) | Mark all notifications as read |
| `DELETE` | `/api/notifications/:id` | Private (All Roles) | Delete a notification |

---

## 7. Frontend Integration

1. **`NotificationBell` ([NotificationBell.tsx](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/client/src/components/common/NotificationBell.tsx))**:
   - Integrated into the global navigation bar.
   - Shows badge with unread count.
   - Dropdown with recent notifications, "Mark All as Read", and quick navigation to the corresponding appointment or consultation room.
   - Real-time polling every 30 seconds.
2. **`NotificationsPage` ([NotificationsPage.tsx](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/client/src/pages/notifications/NotificationsPage.tsx))**:
   - Complete notification directory with All / Unread filtering and deletion management.
