# Privacy Policy — HealthPulse Hospital

*Last updated: August 2026*

> **Online Version:** The official and up-to-date Privacy Policy is hosted directly on the web application at [`/privacy`](https://healthpluse.vercel.app/privacy).

HealthPulse operates an intelligent healthcare appointment scheduling, doctor availability management, and clinical consultation software platform.

---

## 1. Information We Collect

- **Account & Profile Data:** Name, email address, phone number, role (Patient, Doctor, or Admin), and securely hashed passwords.
- **Healthcare & Clinical Records:** Selected doctors, departments, appointment schedules, symptom notes, prescriptions, and invoice status.
- **Google OAuth Data:** When you connect Google Calendar, we receive OAuth tokens to synchronize confirmed medical appointments.

---

## 2. Google Calendar Integration & OAuth Scopes

HealthPulse requests the following Google OAuth scopes:
- `https://www.googleapis.com/auth/calendar.events` (Manage appointment events on primary calendar)
- `https://www.googleapis.com/auth/userinfo.email` (Identify connected Google account)

### Google API Services User Data Policy Compliance (Limited Use Disclosure)
HealthPulse's use and transfer of information received from Google APIs to any other app will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements:
- **No Third-Party Sharing:** We do not sell, rent, or transfer Google user data to data brokers, ad networks, or third parties.
- **No Advertising:** Google user data is never used for serving ads or marketing campaigns.
- **No Generalized AI Training:** Google Calendar data is never used to train generalized artificial intelligence (AI) or machine learning (ML) models.
- **Strict Human Access Restrictions:** No employees or administrators access your private calendar entries.

---

## 3. Data Storage & Security (AES-256-GCM)

All Google OAuth access and refresh tokens are encrypted at rest using industry-standard **AES-256-GCM** authenticated encryption before storage. Tokens are never exposed to the frontend client. All network transmissions are strictly enforced over TLS/HTTPS.

---

## 4. User Rights & Permission Revocation

Users may disconnect Google Calendar at any time via:
1. **In-App:** Profile Settings &rarr; Disconnect Calendar.
2. **Google Account:** [Google Third-Party App Permissions](https://myaccount.google.com/permissions).

To request permanent account or data deletion, contact the developer below.

---

## 5. Contact & Developer Details

- **Lead Administrator & Developer:** Adarsh
- **Email:** [1975adarsh@gmail.com](mailto:1975adarsh@gmail.com)
- **Application URL:** [https://health-pulse.app](https://health-pulse.app)
- **Privacy Policy URL:** [https://health-pulse.app/privacy](https://health-pulse.app/privacy)
- **Terms of Service URL:** [https://health-pulse.app/terms](https://health-pulse.app/terms)
