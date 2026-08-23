const config = require('../../config/env');

/**
 * Email Alert sent to Hospital Administrators when a Doctor submits a Password Reset Request
 */
const doctorResetPending = (data) => {
  const { doctorName, doctorEmail, requestedAt } = data;
  const subject = `ACTION REQUIRED: Doctor Password Reset Request — Dr. ${doctorName}`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #3931AF;">
      Clinical Account Reset Approval Required
    </h2>
    <p style="margin: 0 0 16px 0;">Hello Hospital Administrator,</p>
    <p style="margin: 0 0 20px 0;">
      A password reset request has been logged by a physician on the HealthPulse Clinical Network:
    </p>

    <div style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14.5px; line-height: 24px;">
        <tr>
          <td style="width: 140px; color: #64748B;"><strong>Physician Name:</strong></td>
          <td style="color: #0F172A; font-weight: 700;">Dr. ${doctorName}</td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Doctor Email:</strong></td>
          <td style="color: #0F172A;">${doctorEmail}</td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Role:</strong></td>
          <td><span style="background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">DOCTOR</span></td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Requested At:</strong></td>
          <td style="color: #0F172A;">${requestedAt}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748B;">
      Please log in to the HealthPulse Administrator Portal to review and approve or decline this request. Upon approval, an ephemeral 6-digit OTP will be dispatched to the doctor.
    </p>
  `;

  const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #F8FAFC; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #E2E8F0;">
    ${contentHtml}
    <div style="text-align: center; margin-top: 24px;">
      <a href="${frontendUrl}/admin/doctor-reset-requests" style="background-color: #0062CC; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Review Doctor Reset Queue
      </a>
    </div>
  </div>
</body>
</html>`;

  const text = `Hello Administrator,\n\nA doctor password reset request was logged for Dr. ${doctorName} (${doctorEmail}) at ${requestedAt}.\n\nPlease review in the Admin Dashboard: ${frontendUrl}/admin/doctor-reset-requests\n\nHealthPulse Security`;

  return { subject, html, text };
};

module.exports = doctorResetPending;
