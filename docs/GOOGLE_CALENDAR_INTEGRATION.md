# Google Calendar Integration Specification (Phase 6)

## 1. Overview & Architecture

Phase 6 implements the **Google Calendar Synchronization Engine** for HealthPulse. It provides optional, two-way calendar sync for patients and doctors without ever compromising critical booking transaction reliability.

```text
                  Appointment Lifecycle Event
              (Booked / Rescheduled / Cancelled)
                               │
                               ▼
                    Database Commit Success
                               │
                               ▼
                  Background Calendar Job
                    [calendarJob.js]
                               │
                               ▼
                   Google Calendar Service
                 [googleCalendarService.js]
                               │
                               ▼
                     Google Calendar API
                   (OAuth 2.0 authorized)
```

---

## 2. Security & Token Handling

- **OAuth 2.0 Authorization**: Authorization is initiated by the user through Google's consent screen with the offline access parameter.
- **CSRF State Parameter**: Encodes user identification and request timestamp to prevent cross-site request forgery during callback handling.
- **Token Redaction**: `accessToken` and `refreshToken` are strictly excluded from API JSON responses and never passed to the React frontend or in URL query parameters.
- **Automatic Token Refresh**: The Google OAuth2 client automatically listens for token refresh events and persists updated tokens into the `CalendarConnection` collection.

---

## 3. Calendar Connection Data Model

```javascript
// server/models/CalendarConnection.js
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    default: 'GOOGLE',
    enum: ['GOOGLE']
  },
  googleAccountEmail: {
    type: String,
    default: ''
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: Number,
    default: 0
  },
  scope: [String],
  isConnected: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Appointment Google Calendar Fields

```javascript
// Additions to server/models/Appointment.js
{
  googleCalendarEventId: {
    type: String,
    default: null
  },
  calendarSyncStatus: {
    type: String,
    enum: ['NOT_REQUIRED', 'PENDING', 'SYNCED', 'FAILED'],
    default: 'NOT_REQUIRED'
  }
}
```

---

## 5. Event Privacy & Metadata Policy

To ensure complete patient confidentiality and HIPAA/privacy compliance when communicating with external Google servers:
- **Title**: `Medical Consultation - Dr. <DoctorName>` (No diagnostic labels).
- **Description**: Only operational consultation identifiers:
  ```text
  HealthPulse Appointment Reference: <appointmentId>
  Practitioner: Dr. <DoctorName>
  Patient: <PatientName>
  ```
- **Strictly Excluded**: Symptoms, patient notes, clinical notes, diagnoses, medications, and prescriptions are **NEVER** sent to Google Calendar.

---

## 6. Fault Isolation & Retry Strategy

1. **Non-Blocking Execution**: Appointment booking, cancellation, and rescheduling are committed to MongoDB first. Calendar jobs execute asynchronously via `queueCalendarJob`.
2. **Failure Resilience**: If Google APIs return an error or are unreachable, the appointment remains completely valid and booked. The appointment's `calendarSyncStatus` is flagged as `FAILED`.
3. **Exponential Backoff**: Background sync attempts retry up to 3 times before entering a failed state.
4. **Duplicate Prevention**: Before creating an event, the service checks if `googleCalendarEventId` is already present. If present, it executes an update rather than creating duplicates.

---

## 7. API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/calendar/oauth/url` | Private (All Roles) | Get Google OAuth consent screen URL |
| `GET` | `/api/calendar/oauth/callback` | Public (Google Redirect) | Google OAuth redirect callback |
| `GET` | `/api/calendar/status` | Private (All Roles) | Get connection status & linked email |
| `POST` | `/api/calendar/disconnect` | Private (All Roles) | Disconnect Google Calendar |
| `POST` | `/api/calendar/sync/:appointmentId` | Private (All Roles) | Manually trigger sync for an appointment |

---

## 8. Frontend Integration

- **`CalendarSettingsCard` ([CalendarSettingsCard.tsx](file:///c:/WEB%20DEVELOPMENT/healthcare-appointment-manager/client/src/components/calendar/CalendarSettingsCard.tsx))**:
  - Integrated into Doctor Profile (`/doctor/profile`) and Patient Appointments (`/patient/appointments`).
  - Displays dynamic connection status, linked Google email, and one-click Connect / Disconnect buttons.
