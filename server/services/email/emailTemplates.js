/**
 * Reusable HTML and plain text email templates
 */

const baseEmailLayout = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 20px; font-weight: 800; color: #0ea5e9; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
    .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 12px; }
    .content { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .highlight-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; margin: 18px 0; }
    .highlight-item { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .highlight-item:last-child { margin-bottom: 0; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #f8fafc; font-weight: 600; }
    .footer { border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">HealthPulse</div>
      <div class="title">${title}</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      This is an automated notification from HealthPulse Healthcare System. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
`;

const buildAppointmentBookedEmail = ({ recipientName, doctorName, patientName, date, startTime, endTime, isDoctor }) => {
  const title = isDoctor ? 'New Consultation Scheduled' : 'Appointment Confirmation';
  const otherName = isDoctor ? patientName : doctorName;
  const otherRole = isDoctor ? 'Patient' : 'Practitioner';

  const html = baseEmailLayout(
    title,
    `
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>${isDoctor ? 'A new consultation has been booked on your schedule.' : 'Your appointment has been successfully booked and confirmed.'}</p>
    <div class="highlight-box">
      <div class="highlight-item"><span class="label">${otherRole}:</span><span class="value">${otherName}</span></div>
      <div class="highlight-item"><span class="label">Consultation Date:</span><span class="value">${date}</span></div>
      <div class="highlight-item"><span class="label">Time Window:</span><span class="value">${startTime} – ${endTime}</span></div>
    </div>
    <p>You can view and manage this appointment on your HealthPulse dashboard.</p>
    `
  );

  const text = `HealthPulse: ${title}\n\nDear ${recipientName},\n\nAppointment with ${otherRole}: ${otherName}\nDate: ${date}\nTime: ${startTime} - ${endTime}\n\nPlease visit your HealthPulse dashboard for full details.`;

  return { subject: `HealthPulse: ${title} - ${date}`, html, text };
};

const buildAppointmentCancelledEmail = ({ recipientName, date, startTime, isDoctor, otherPartyName, reason }) => {
  const title = 'Appointment Cancellation Notice';

  const html = baseEmailLayout(
    title,
    `
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>This is to notify you that the following consultation has been <strong>cancelled</strong>:</p>
    <div class="highlight-box">
      <div class="highlight-item"><span class="label">With:</span><span class="value">${otherPartyName}</span></div>
      <div class="highlight-item"><span class="label">Scheduled Date:</span><span class="value">${date}</span></div>
      <div class="highlight-item"><span class="label">Scheduled Time:</span><span class="value">${startTime}</span></div>
      ${reason ? `<div class="highlight-item"><span class="label">Reason:</span><span class="value">${reason}</span></div>` : ''}
    </div>
    <p>If you need to rebook or have questions, please log in to your HealthPulse portal.</p>
    `
  );

  const text = `HealthPulse: ${title}\n\nDear ${recipientName},\n\nYour appointment scheduled with ${otherPartyName} on ${date} at ${startTime} has been cancelled.`;

  return { subject: `HealthPulse: ${title} - ${date}`, html, text };
};

const buildAppointmentRescheduledEmail = ({ recipientName, otherPartyName, isDoctor, date, startTime, endTime }) => {
  const title = 'Appointment Rescheduled Notice';

  const html = baseEmailLayout(
    title,
    `
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>Your consultation with <strong>${otherPartyName}</strong> has been successfully rescheduled to a new time window:</p>
    <div class="highlight-box">
      <div class="highlight-item"><span class="label">With:</span><span class="value">${otherPartyName}</span></div>
      <div class="highlight-item"><span class="label">New Date:</span><span class="value">${date}</span></div>
      <div class="highlight-item"><span class="label">New Time:</span><span class="value">${startTime} – ${endTime}</span></div>
    </div>
    <p>Please check your HealthPulse schedule for any updates.</p>
    `
  );

  const text = `HealthPulse: ${title}\n\nDear ${recipientName},\n\nYour appointment with ${otherPartyName} has been rescheduled to ${date} at ${startTime} - ${endTime}.`;

  return { subject: `HealthPulse: ${title} - ${date}`, html, text };
};

const buildAppointmentReminderEmail = ({ recipientName, otherPartyName, isDoctor, date, startTime, endTime }) => {
  const title = 'Upcoming Consultation Reminder';
  const otherRole = isDoctor ? 'Patient' : 'Practitioner';

  const html = baseEmailLayout(
    title,
    `
    <p>Dear <strong>${recipientName}</strong>,</p>
    <p>This is a friendly reminder that you have an upcoming consultation scheduled today:</p>
    <div class="highlight-box">
      <div class="highlight-item"><span class="label">${otherRole}:</span><span class="value">${otherPartyName}</span></div>
      <div class="highlight-item"><span class="label">Date:</span><span class="value">${date}</span></div>
      <div class="highlight-item"><span class="label">Time:</span><span class="value">${startTime} – ${endTime}</span></div>
    </div>
    <p>Please make sure to be available 5 minutes prior to your scheduled consultation time.</p>
    `
  );

  const text = `HealthPulse: ${title}\n\nDear ${recipientName},\n\nReminder: You have an upcoming consultation with ${otherPartyName} on ${date} at ${startTime} - ${endTime}.`;

  return { subject: `HealthPulse Reminder: Consultation with ${otherPartyName} at ${startTime}`, html, text };
};

const buildPrescriptionAvailableEmail = ({ patientName, doctorName, date, startTime }) => {
  const title = 'Your Medical Prescription is Available';

  const html = baseEmailLayout(
    title,
    `
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Dr. <strong>${doctorName}</strong> has finalized your consultation and issued your structured medical prescription for your visit on ${date}.</p>
    <p>You can securely view your medication regimen, dosages, and care instructions in your HealthPulse portal.</p>
    <div class="highlight-box">
      <div class="highlight-item"><span class="label">Doctor:</span><span class="value">${doctorName}</span></div>
      <div class="highlight-item"><span class="label">Consultation Date:</span><span class="value">${date}</span></div>
    </div>
    <p>Please log in to HealthPulse to review your prescription.</p>
    `
  );

  const text = `HealthPulse: ${title}\n\nDear ${patientName},\n\nDr. ${doctorName} has issued your medical prescription for the consultation on ${date}. Log in to HealthPulse to view it.`;

  return { subject: `HealthPulse: Medical Prescription Ready from Dr. ${doctorName}`, html, text };
};

module.exports = {
  buildAppointmentBookedEmail,
  buildAppointmentCancelledEmail,
  buildAppointmentRescheduledEmail,
  buildAppointmentReminderEmail,
  buildPrescriptionAvailableEmail,
};
