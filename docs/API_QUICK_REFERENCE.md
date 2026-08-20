# HealthPulse — API Quick Reference

```text
AUTH:
  POST   /api/auth/register                    - Register patient
  POST   /api/auth/login                       - Login & get JWT token
  GET    /api/auth/me                          - Get current user

DOCTORS:
  GET    /api/doctors                          - Search & list doctors
  GET    /api/doctors/:id                      - Get doctor profile & working hours
  POST   /api/doctors                          - [ADMIN] Provision doctor
  PUT    /api/doctors/:id/schedule             - [DOCTOR/ADMIN] Update hours
  POST   /api/doctors/:id/leaves               - [DOCTOR/ADMIN] Add leave
  DELETE /api/doctors/:id/leaves/:leaveId      - [DOCTOR/ADMIN] Remove leave

APPOINTMENTS:
  GET    /api/appointments/slots               - Query available slots
  POST   /api/appointments                     - [PATIENT] Book appointment
  GET    /api/appointments/my                  - Get user's appointments
  GET    /api/appointments/:id                 - Get appointment details
  PUT    /api/appointments/:id/cancel          - Cancel appointment
  PUT    /api/appointments/:id/reschedule      - Reschedule appointment

CLINICAL:
  POST   /api/clinical/consultation            - [DOCTOR] Complete visit & notes
  GET    /api/clinical/appointment/:id         - Get clinical record & Rx

LEAVES:
  POST   /api/leaves                           - Request leave
  GET    /api/leaves                           - List leaves
  PUT    /api/leaves/:id/status                - [ADMIN] Approve/reject leave
  DELETE /api/leaves/:id                       - Cancel leave

NOTIFICATIONS:
  GET    /api/notifications                    - Get notifications
  PUT    /api/notifications/:id/read           - Mark read
  PUT    /api/notifications/read-all           - Mark all read

MEDICATIONS:
  GET    /api/medications/reminders            - [PATIENT] Get dose schedule
  PUT    /api/medications/reminders/:id/status - [PATIENT] Mark dose status

CALENDAR:
  GET    /api/calendar/auth                    - Direct Google OAuth start
  GET    /api/calendar/oauth/url               - In-app Google OAuth URL
  GET    /api/calendar/oauth/callback          - OAuth callback redirect
  GET    /api/calendar/auth/callback           - OAuth callback alias
  GET    /api/calendar/status                  - Get connection status
  POST   /api/calendar/disconnect              - Disconnect calendar
  POST   /api/calendar/sync/:appointmentId     - Manual sync appointment
```
