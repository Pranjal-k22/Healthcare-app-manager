const config = require('../../config/env');

const BRAND = {
  primaryDark: '#3931AF',
  primary: '#0062CC',
  primaryLight: '#2B7FFF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgLight: '#F8FAFC',
  cardBg: '#FFFFFF',
  borderColor: '#E2E8F0',
  successColor: '#10B981',
  dangerColor: '#EF4444',
  warningColor: '#F59E0B',
};

/**
 * Base Email Layout Wrapper for Consistent Clinical Branding
 */
const renderEmailLayout = ({ title, preheader, contentHtml, ctaText, ctaUrl }) => {
  const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
  const supportEmail = config.SUPPORT_EMAIL || 'support@healthpulse.com';
  const resolvedCtaUrl = ctaUrl ? (ctaUrl.startsWith('http') ? ctaUrl : `${frontendUrl}${ctaUrl}`) : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: ${BRAND.bgLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.textDark}; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bgLight};">
  <div style="display: none; font-size: 1px; color: #fff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: ${BRAND.bgLight};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${BRAND.cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid ${BRAND.borderColor};">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%); background-color: ${BRAND.primary}; padding: 28px 32px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; vertical-align: middle;">
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">HealthPulse</span>
                      <span style="font-size: 13px; color: rgba(255,255,255,0.85); display: block; margin-top: 2px;">Medical & Follow-up Portal</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; color: ${BRAND.textDark}; font-size: 15px; line-height: 24px;">
              ${contentHtml}

              ${
                resolvedCtaUrl && ctaText
                  ? `
              <div style="margin-top: 32px; text-align: center;">
                <a href="${resolvedCtaUrl}" target="_blank" style="background-color: ${BRAND.primary}; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 98, 204, 0.25);">
                  ${ctaText}
                </a>
              </div>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid ${BRAND.borderColor}; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAFAFC; text-align: center; font-size: 12px; line-height: 18px; color: ${BRAND.textMuted};">
              <p style="margin: 0 0 8px 0;">This is an automated message from <strong>HealthPulse Hospital</strong>.</p>
              <p style="margin: 0 0 8px 0;">If you have any questions or need medical assistance, contact us at <a href="mailto:${supportEmail}" style="color: ${BRAND.primary}; text-decoration: none;">${supportEmail}</a>.</p>
              <p style="margin: 0; color: #94A3B8;">&copy; ${new Date().getFullYear()} HealthPulse Clinical Systems. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * 1. Booking Confirmation Template
 */
const bookingConfirmation = (data) => {
  const {
    recipientName = 'Valued User',
    recipientRole = 'PATIENT',
    doctorName = 'Physician',
    patientName = 'Patient',
    specialisation = 'General Medicine',
    date,
    time,
    fee,
    appointmentId,
  } = data;

  const isPatient = String(recipientRole).toUpperCase() === 'PATIENT';
  const subject = isPatient
    ? `Appointment Confirmed: Dr. ${doctorName} on ${date}`
    : `New Consultation Booked: ${patientName} on ${date}`;

  const contentHtml = isPatient
    ? `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">Appointment Confirmed</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">Your medical consultation with <strong>Dr. ${doctorName}</strong> (${specialisation}) has been successfully scheduled.</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: ${BRAND.textMuted}; width: 130px;"><strong>Date:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Time:</strong></td>
          <td style="color: ${BRAND.textDark};">${time}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Doctor:</strong></td>
          <td style="color: ${BRAND.textDark};">Dr. ${doctorName} (${specialisation})</td>
        </tr>
        ${
          fee
            ? `
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Consultation Fee:</strong></td>
          <td style="color: ${BRAND.textDark};">$${fee}</td>
        </tr>`
            : ''
        }
        ${
          appointmentId
            ? `
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Reference ID:</strong></td>
          <td style="color: ${BRAND.textDark}; font-family: monospace;">${appointmentId}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">Please arrive 10 minutes prior to your scheduled time or check in online.</p>
  `
    : `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">New Patient Appointment Booked</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>Dr. ${doctorName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">A new consultation has been booked on your calendar with patient <strong>${patientName}</strong>.</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: ${BRAND.textMuted}; width: 130px;"><strong>Patient:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${patientName}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Date:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Time:</strong></td>
          <td style="color: ${BRAND.textDark};">${time}</td>
        </tr>
        ${
          appointmentId
            ? `
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Appointment ID:</strong></td>
          <td style="color: ${BRAND.textDark}; font-family: monospace;">${appointmentId}</td>
        </tr>`
            : ''
        }
      </table>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Your appointment details for ${date} at ${time}.`,
    contentHtml,
    ctaText: isPatient ? 'View My Appointments' : 'Open Doctor Portal',
    ctaUrl: isPatient ? '/patient/appointments' : '/doctor/schedule',
  });

  const text = isPatient
    ? `Hello ${recipientName},\n\nYour appointment with Dr. ${doctorName} (${specialisation}) has been confirmed for ${date} at ${time}.\n\nReference ID: ${appointmentId || 'N/A'}\nConsultation Fee: $${fee || '75.00'}\n\nView details: ${config.FRONTEND_URL}/patient/appointments\n\nHealthPulse Hospital`
    : `Hello Dr. ${doctorName},\n\nA new consultation has been booked by patient ${patientName} on ${date} at ${time}.\n\nAppointment ID: ${appointmentId || 'N/A'}\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 2. Appointment Reminder Template (24h or 1h)
 */
const appointmentReminder = (data) => {
  const {
    recipientName = 'Patient',
    doctorName = 'Physician',
    patientName = 'Patient',
    date,
    time,
    hoursUntil = 24,
    appointmentId,
  } = data;

  const timeFrame = hoursUntil <= 1 ? 'in 1 hour' : 'tomorrow';
  const subject = `Reminder: Upcoming Appointment with Dr. ${doctorName} ${timeFrame}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">Appointment Reminder</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">This is a friendly reminder that you have an upcoming consultation scheduled for <strong>${timeFrame}</strong>.</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: ${BRAND.textMuted}; width: 130px;"><strong>Practitioner:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>Dr. ${doctorName}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Date:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Time:</strong></td>
          <td style="color: ${BRAND.textDark};">${time}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">If you need to reschedule or cancel, please visit your portal at least 2 hours prior to avoid late cancellation fees.</p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Reminder for your consultation with Dr. ${doctorName} on ${date} at ${time}.`,
    contentHtml,
    ctaText: 'View Appointment Details',
    ctaUrl: '/patient/appointments',
  });

  const text = `Hello ${recipientName},\n\nReminder: You have an appointment with Dr. ${doctorName} ${timeFrame} on ${date} at ${time}.\n\nView details: ${config.FRONTEND_URL}/patient/appointments\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 3. Appointment Cancellation Template
 */
const appointmentCancellation = (data) => {
  const {
    recipientName = 'User',
    recipientRole = 'PATIENT',
    doctorName = 'Physician',
    patientName = 'Patient',
    date,
    time,
    reason = 'Cancelled by user',
    appointmentId,
  } = data;

  const isPatient = String(recipientRole).toUpperCase() === 'PATIENT';
  const subject = `Appointment Cancelled: ${date} at ${time}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.dangerColor};">Appointment Cancelled</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">The following medical appointment has been cancelled:</p>

    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: #991B1B; width: 130px;"><strong>Date:</strong></td>
          <td style="color: #991B1B;"><strong>${date}</strong></td>
        </tr>
        <tr>
          <td style="color: #991B1B;"><strong>Time:</strong></td>
          <td style="color: #991B1B;">${time}</td>
        </tr>
        <tr>
          <td style="color: #991B1B;"><strong>Doctor:</strong></td>
          <td style="color: #991B1B;">Dr. ${doctorName}</td>
        </tr>
        <tr>
          <td style="color: #991B1B;"><strong>Patient:</strong></td>
          <td style="color: #991B1B;">${patientName}</td>
        </tr>
        ${
          reason
            ? `
        <tr>
          <td style="color: #991B1B;"><strong>Reason:</strong></td>
          <td style="color: #991B1B;">${reason}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    ${
      isPatient
        ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">You can book a new consultation slot whenever you are ready.</p>`
        : `<p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">This slot has been released back to your available schedule.</p>`
    }
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Your appointment for ${date} at ${time} was cancelled.`,
    contentHtml,
    ctaText: isPatient ? 'Book New Consultation' : 'View Schedule',
    ctaUrl: isPatient ? '/patient/doctors' : '/doctor/schedule',
  });

  const text = `Hello ${recipientName},\n\nThe appointment on ${date} at ${time} with ${isPatient ? `Dr. ${doctorName}` : `patient ${patientName}`} has been cancelled.\nReason: ${reason}\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 4. Doctor Leave Conflict Notification Template
 */
const doctorLeaveConflict = (data) => {
  const {
    patientName = 'Patient',
    doctorName = 'Physician',
    date,
    time,
    rescheduleLink = '/patient/doctors',
  } = data;

  const subject = `Action Required: Schedule Change for your Appointment with Dr. ${doctorName}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.warningColor};">Doctor Schedule Update</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">Dr. <strong>${doctorName}</strong> will be out of office on <strong>${date}</strong> and is unable to hold your scheduled consultation at ${time}.</p>

    <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 20px;">
        We apologize for this unexpected change. Please use the button below to easily choose another available time slot or connect with an alternate specialist.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Dr. ${doctorName} is unavailable on ${date}. Please reschedule your appointment.`,
    contentHtml,
    ctaText: 'Reschedule Appointment Now',
    ctaUrl: rescheduleLink,
  });

  const text = `Hello ${patientName},\n\nDr. ${doctorName} will be away on ${date} and unable to hold your appointment at ${time}.\n\nPlease reschedule your consultation here: ${config.FRONTEND_URL}${rescheduleLink}\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 5. Medication Reminder Template
 */
const medicationReminder = (data) => {
  const {
    patientName = 'Patient',
    medicationName = 'Prescription Medicine',
    dosage = '1 dose',
    doseTime = 'Now',
    instructions = 'Take as prescribed',
  } = data;

  const subject = `Medication Reminder: ${medicationName} (${dosage})`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primary};">Medication Reminder</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">It is time to take your prescribed medication dose:</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: ${BRAND.textMuted}; width: 130px;"><strong>Medication:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${medicationName}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Dosage:</strong></td>
          <td style="color: ${BRAND.textDark};">${dosage}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Scheduled Time:</strong></td>
          <td style="color: ${BRAND.textDark};">${doseTime}</td>
        </tr>
        ${
          instructions
            ? `
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Instructions:</strong></td>
          <td style="color: ${BRAND.textDark};">${instructions}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">Please log in to your portal to mark this dose as taken.</p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Time to take ${medicationName} (${dosage}).`,
    contentHtml,
    ctaText: 'Open Prescriptions',
    ctaUrl: '/patient/prescriptions',
  });

  const text = `Hello ${patientName},\n\nMedication Reminder: It is time to take your ${medicationName} (${dosage}) scheduled for ${doseTime}.\nInstructions: ${instructions}\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 6. Security Notification: Password Changed Template
 */
const passwordChanged = (data) => {
  const { recipientName = 'User' } = data;
  const subject = 'Security Alert: Your HealthPulse Password Was Changed';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">Password Changed Successfully</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">The password for your HealthPulse Hospital account was recently updated. All existing login sessions have been invalidated for your security.</p>

    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
      <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 20px;">
        <strong>If you did not make this change</strong>, please contact our support team immediately or reset your password.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Your account password was recently changed.',
    contentHtml,
    ctaText: 'Review Account Security',
    ctaUrl: '/patient/profile',
  });

  const text = `Hello ${recipientName},\n\nYour HealthPulse account password was successfully changed.\n\nIf you did not perform this change, please contact support immediately at ${config.SUPPORT_EMAIL || 'support@healthpulse.com'}.\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 7. Welcome Doctor: Account Credentials & Password Change Guide
 */
const doctorWelcome = (data) => {
  const { doctorName, email, temporaryPassword, specialization } = data;
  const subject = 'Welcome to HealthPulse: Doctor Portal Access Credentials';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primaryDark};">Welcome to HealthPulse Clinical Staff</h2>
    <p style="margin: 0 0 16px 0;">Dear <strong>Dr. ${doctorName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">Your official physician profile has been provisioned on the HealthPulse Hospital Management Platform. Below are your initial login credentials:</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1.5px solid ${BRAND.borderColor}; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="6" cellspacing="0" width="100%" style="font-size: 14px;">
        <tr>
          <td style="color: ${BRAND.textMuted}; width: 140px;"><strong>Specialization:</strong></td>
          <td style="color: ${BRAND.textDark};"><strong>${specialization || 'Clinical Specialist'}</strong></td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Login Email:</strong></td>
          <td style="color: ${BRAND.primary}; font-weight: 700;">${email}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Assigned Password:</strong></td>
          <td style="color: #b91c1c; font-family: monospace; font-size: 15px; font-weight: 700; background: #fee2e2; padding: 4px 8px; border-radius: 4px; display: inline-block;">${temporaryPassword}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; color: #92400E; font-size: 13.5px; line-height: 20px;">
      <strong>⚠️ Action Required:</strong> For security compliance, please log in and change your temporary password immediately in your <strong>Doctor Profile Settings</strong>.
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Welcome Dr. ${doctorName}, here are your physician portal login credentials.`,
    contentHtml,
    ctaText: 'Log In to Doctor Portal',
    ctaUrl: '/login',
  });

  const text = `Dear Dr. ${doctorName},\n\nWelcome to HealthPulse. Your doctor portal account has been created.\n\nLogin Email: ${email}\nAssigned Password: ${temporaryPassword}\nSpecialization: ${specialization}\n\nPlease sign in at ${config.FRONTEND_URL || 'http://localhost:5173'}/login and update your password in Profile Settings.\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 8. Welcome Administrator: Admin Account Created
 */
const adminWelcome = (data) => {
  const { adminName, email } = data;
  const subject = 'HealthPulse Administrator Account Activated';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primaryDark};">System Administrator Access Activated</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${adminName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">Your administrator privileges on the HealthPulse Hospital Management System are active with email <strong>${email}</strong>.</p>
    <p style="margin: 0 0 20px 0;">You can now manage clinic schedules, provision doctors, audit appointments, and configure system integrations.</p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Your HealthPulse Administrator Account is ready.',
    contentHtml,
    ctaText: 'Open Admin Dashboard',
    ctaUrl: '/admin/dashboard',
  });

  const text = `Hello ${adminName},\n\nYour HealthPulse administrator account (${email}) is active.\n\nHealthPulse Clinical Systems`;

  return { subject, html, text };
};

/**
 * 9. Admin Notification: New Doctor Provisioned
 */
const doctorProvisionedAdminAlert = (data) => {
  const { doctorName, email, specialization, provisionedByName } = data;
  const subject = `Admin Alert: New Doctor Profile Provisioned (Dr. ${doctorName})`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">New Doctor Profile Created</h2>
    <p style="margin: 0 0 16px 0;">A new physician was provisioned on HealthPulse by <strong>${provisionedByName || 'Admin'}</strong>:</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
      <p style="margin: 4px 0;"><strong>Doctor Name:</strong> Dr. ${doctorName}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 4px 0;"><strong>Specialization:</strong> ${specialization}</p>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `New physician profile Dr. ${doctorName} provisioned.`,
    contentHtml,
    ctaText: 'View Doctors Directory',
    ctaUrl: '/admin/doctors',
  });

  const text = `New Doctor Provisioned:\nDr. ${doctorName}\nEmail: ${email}\nSpecialty: ${specialization}\nProvisioned By: ${provisionedByName}\n\nHealthPulse Hospital`;

  return { subject, html, text };
};

/**
 * 10. Prescription Issued / Medicine Prescribed Template
 */
const prescriptionIssued = (data) => {
  const {
    recipientName = 'Patient',
    doctorName = 'Physician',
    specialisation = 'General Practice',
    medicines = [],
    instructions = '',
    durationDays,
    appointmentId,
  } = data;

  const subject = `Your Medical Prescription & Care Plan — Dr. ${doctorName}`;

  const medicinesRowsHtml = Array.isArray(medicines) && medicines.length > 0
    ? medicines.map((m, idx) => `
      <tr style="border-bottom: 1px solid ${BRAND.borderColor};">
        <td style="padding: 10px 8px; font-weight: 600; color: ${BRAND.textDark};">${idx + 1}. ${m.name || 'Medication'}</td>
        <td style="padding: 10px 8px; color: ${BRAND.textDark};">${m.dosage || '—'}</td>
        <td style="padding: 10px 8px; color: ${BRAND.textDark};">${m.frequency || '—'}</td>
        <td style="padding: 10px 8px; color: ${BRAND.textDark};">${m.duration || (durationDays ? `${durationDays} days` : '—')}</td>
        <td style="padding: 10px 8px; color: ${BRAND.textMuted}; font-size: 13px;">${m.instructions || 'As directed'}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="5" style="padding: 12px; color: ${BRAND.textMuted}; text-align: center;">See portal for itemized medication schedule</td></tr>`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primaryDark};">Prescription & Medication Plan</h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">Following your recent medical consultation, <strong>Dr. ${doctorName}</strong> (${specialisation}) has issued an official medical prescription and care plan:</p>

    <div style="background-color: #FFFFFF; border: 1px solid ${BRAND.borderColor}; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
      <div style="background-color: ${BRAND.bgLight}; padding: 12px 16px; border-bottom: 1px solid ${BRAND.borderColor}; font-weight: 700; color: ${BRAND.textDark};">
        📋 Prescribed Medications
      </div>
      <div style="overflow-x: auto;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; text-align: left;">
          <thead>
            <tr style="background-color: #F1F5F9; color: ${BRAND.textMuted}; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 8px;">Medicine</th>
              <th style="padding: 8px;">Dosage</th>
              <th style="padding: 8px;">Frequency</th>
              <th style="padding: 8px;">Duration</th>
              <th style="padding: 8px;">Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    ${instructions ? `
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
      <strong style="color: #166534; font-size: 13px; display: block; margin-bottom: 4px;">Doctor's Clinical Advice:</strong>
      <p style="margin: 0; color: #14532D; font-size: 14px;">${instructions}</p>
    </div>
    ` : ''}

    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.textMuted};">
      Your personalized digital medication schedule and dose adherence reminders are now active in your patient dashboard.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Dr. ${doctorName} has issued your medical prescription and care instructions.`,
    contentHtml,
    ctaText: 'View Medication Schedule in Portal',
    ctaUrl: '/patient/prescriptions',
  });

  const textMedicines = Array.isArray(medicines)
    ? medicines.map(m => `- ${m.name} (${m.dosage || ''}): ${m.frequency || ''} for ${m.duration || ''}. Instructions: ${m.instructions || 'As directed'}`).join('\n')
    : 'View portal for itemized list.';

  const text = `Hello ${recipientName},\n\nDr. ${doctorName} has issued your prescription:\n\n${textMedicines}\n\nDoctor Instructions: ${instructions || 'Follow package instructions'}\n\nHealthPulse Hospital Clinical Systems`;

  return { subject, html, text };
};

/**
 * 11. Admin Notification: Doctor Submitted Leave Request (Pending Review)
 */
const doctorLeaveRequestedAdminAlert = (data) => {
  const { doctorName, doctorEmail, specialization = 'General Medicine', startDate, endDate, reason } = data;
  const subject = `Action Required: Leave Application from Dr. ${doctorName} (${startDate} to ${endDate})`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.textDark};">Doctor Leave Application Submitted</h2>
    <p style="margin: 0 0 16px 0;">Hello Administrator,</p>
    <p style="margin: 0 0 20px 0;"><strong>Dr. ${doctorName}</strong> has submitted a new leave request requiring your administrative review and approval.</p>

    <div style="background-color: ${BRAND.bgLight}; border: 1px solid ${BRAND.borderColor}; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14.5px; line-height: 24px;">
        <tr>
          <td style="width: 140px; color: ${BRAND.textMuted};"><strong>Doctor:</strong></td>
          <td style="color: ${BRAND.textDark}; font-weight: 700;">Dr. ${doctorName} (${specialization})</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Email:</strong></td>
          <td style="color: ${BRAND.textDark};">${doctorEmail}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Leave Period:</strong></td>
          <td style="color: #0284c7; font-weight: 700;">${startDate === endDate ? startDate : `${startDate} to ${endDate}`}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Reason / Notes:</strong></td>
          <td style="color: ${BRAND.textDark};">${reason}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Initial Status:</strong></td>
          <td><span style="background: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">PENDING APPROVAL</span></td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${BRAND.textMuted};">
      Approving this request will automatically block patient booking slots on the doctor's calendar for the selected period.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Dr. ${doctorName} requested leave from ${startDate} to ${endDate}. Review in Admin Portal.`,
    contentHtml,
    ctaText: 'Review Leave Application in Portal',
    ctaUrl: '/admin/manage-doctors',
  });

  const text = `Hello Admin,\n\nDr. ${doctorName} (${specialization}) has applied for leave from ${startDate} to ${endDate}.\nReason: ${reason}\n\nPlease review and approve/reject this request in the Admin Dashboard: ${config.FRONTEND_URL || 'http://localhost:5173'}/admin/manage-doctors\n\nHealthPulse Hospital Clinical Systems`;

  return { subject, html, text };
};

/**
 * 12. Doctor Notification: Leave Request Decision (Approved or Rejected by Admin)
 */
const doctorLeaveDecisionDoctorAlert = (data) => {
  const { doctorName, startDate, endDate, status, reason, adminNotes, approvedByName } = data;
  const isApproved = status === 'APPROVED';
  const subject = `Leave Request ${isApproved ? 'Approved ✅' : 'Declined ❌'}: ${startDate === endDate ? startDate : `${startDate} to ${endDate}`}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${isApproved ? '#059669' : '#dc2626'};">
      Leave Request ${isApproved ? 'Approved' : 'Declined'}
    </h2>
    <p style="margin: 0 0 16px 0;">Dear <strong>Dr. ${doctorName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">
      Your leave application for the period <strong>${startDate === endDate ? startDate : `${startDate} to ${endDate}`}</strong> has been reviewed by <strong>${approvedByName || 'Hospital Administration'}</strong> and marked as:
    </p>

    <div style="background-color: ${isApproved ? '#ECFDF5' : '#FEF2F2'}; border: 1.5px solid ${isApproved ? '#A7F3D0' : '#FECACA'}; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14.5px; line-height: 24px;">
        <tr>
          <td style="width: 140px; color: ${BRAND.textMuted};"><strong>Decision Status:</strong></td>
          <td>
            <span style="background: ${isApproved ? '#10B981' : '#EF4444'}; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">
              ${status}
            </span>
          </td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Leave Period:</strong></td>
          <td style="color: ${BRAND.textDark}; font-weight: 700;">${startDate === endDate ? startDate : `${startDate} to ${endDate}`}</td>
        </tr>
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Your Stated Reason:</strong></td>
          <td style="color: ${BRAND.textDark};">${reason}</td>
        </tr>
        ${adminNotes ? `
        <tr>
          <td style="color: ${BRAND.textMuted};"><strong>Admin Remarks:</strong></td>
          <td style="color: ${BRAND.textDark}; font-style: italic;">"${adminNotes}"</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${BRAND.textMuted};">
      ${isApproved
        ? 'Your public appointment calendar has been updated and patient booking slots during this period are now blocked.'
        : 'If you have any questions regarding this decision, please reach out to the Medical Director or Hospital Administration.'}
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Your leave request for ${startDate} to ${endDate} was ${status.toLowerCase()} by administration.`,
    contentHtml,
    ctaText: 'View Leave Schedule in Doctor Profile',
    ctaUrl: '/doctor/profile',
  });

  const text = `Dear Dr. ${doctorName},\n\nYour leave application for ${startDate} to ${endDate} has been ${status} by administration.\nReason: ${reason}\n${adminNotes ? `Admin Remarks: ${adminNotes}\n` : ''}\nView your schedule at ${config.FRONTEND_URL || 'http://localhost:5173'}/doctor/profile\n\nHealthPulse Hospital Clinical Systems`;

  return { subject, html, text };
};

/**
 * 13. Password Reset Request Email Template
 */
const passwordReset = (data) => {
  const { userName, userRole, resetUrl } = data;
  const subject = 'Reset Your HealthPulse Password';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primaryDark};">
      Password Reset Request
    </h2>
    <p style="margin: 0 0 16px 0;">Hello <strong>${userName || 'Valued User'}</strong>,</p>
    <p style="margin: 0 0 20px 0;">
      We received a request to reset your password for your <strong>HealthPulse ${userRole || ''} Account</strong>. Click the button below to set a new password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: ${BRAND.primary}; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 15px;">
        Reset Password
      </a>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13.5px; color: ${BRAND.textMuted};">
      This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, no further action is required and your password will remain unchanged.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Reset your HealthPulse password using this secure 15-minute link.',
    contentHtml,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
  });

  const text = `Hello ${userName},\n\nWe received a request to reset your HealthPulse password.\nPlease click the link below to set a new password (valid for 15 minutes):\n${resetUrl}\n\nIf you did not request this change, please ignore this email.\n\nHealthPulse Clinical Security`;

  return { subject, html, text };
};

/**
 * 14. Doctor Account Activation (First-Time Set Password) Email Template
 */
const doctorActivation = (data) => {
  const { doctorName, doctorEmail, specialization, setPasswordUrl } = data;
  const subject = 'Welcome to HealthPulse — Activate Your Doctor Account';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: ${BRAND.primaryDark};">
      Welcome to the HealthPulse Clinical Team
    </h2>
    <p style="margin: 0 0 16px 0;">Dear <strong>Dr. ${doctorName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">
      An account has been provisioned for you as a <strong>${specialization || 'Consultant Specialist'}</strong> on the HealthPulse Clinical Platform (${doctorEmail}).
    </p>
    <p style="margin: 0 0 20px 0;">
      To complete your registration and activate your account, please click the button below to set your account password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${setPasswordUrl}" style="background-color: ${BRAND.primary}; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 15px;">
        Activate Account & Set Password
      </a>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13.5px; color: ${BRAND.textMuted};">
      This activation link is valid for <strong>48 hours</strong>. Once set, you can log in to your Doctor Portal to manage your consultation schedule and patient visits.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Welcome Dr. ${doctorName}! Set your password to activate your HealthPulse account.`,
    contentHtml,
    ctaText: 'Activate Account & Set Password',
    ctaUrl: setPasswordUrl,
  });

  const text = `Dear Dr. ${doctorName},\n\nAn account has been created for you on HealthPulse (${specialization}).\nPlease activate your account and set your password here:\n${setPasswordUrl}\n\nHealthPulse Hospital Systems`;

  return { subject, html, text };
};

module.exports = {
  renderEmailLayout,
  bookingConfirmation,
  appointmentReminder,
  appointmentCancellation,
  doctorLeaveConflict,
  medicationReminder,
  passwordChanged,
  doctorWelcome,
  adminWelcome,
  doctorProvisionedAdminAlert,
  prescriptionIssued,
  doctorLeaveRequestedAdminAlert,
  doctorLeaveDecisionDoctorAlert,
  passwordReset,
  doctorActivation,
};
