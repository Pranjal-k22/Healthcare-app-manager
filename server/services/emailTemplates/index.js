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

module.exports = {
  renderEmailLayout,
  bookingConfirmation,
  appointmentReminder,
  appointmentCancellation,
  doctorLeaveConflict,
  medicationReminder,
  passwordChanged,
};
