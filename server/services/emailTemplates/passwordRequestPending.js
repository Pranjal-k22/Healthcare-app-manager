const config = require('../../config/env');

/**
 * Email Alert sent to Hospital Administrators when a User submits a Password Reset Request
 */
const passwordRequestPending = (data) => {
  const { requesterName, requesterEmail, requesterRole, requestedAt, requestId } = data;
  const subject = `ACTION REQUIRED: Password Reset Request for ${requesterName} (${requesterRole})`;

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #3931AF;">
      Admin Approval Required
    </h2>
    <p style="margin: 0 0 16px 0;">Hello Administrator,</p>
    <p style="margin: 0 0 20px 0;">
      A password reset application has been submitted and is currently pending review in the HealthPulse Admin Queue:
    </p>

    <div style="background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14.5px; line-height: 24px;">
        <tr>
          <td style="width: 140px; color: #64748B;"><strong>Requester:</strong></td>
          <td style="color: #0F172A; font-weight: 700;">${requesterName}</td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Email Address:</strong></td>
          <td style="color: #0F172A;">${requesterEmail}</td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Account Role:</strong></td>
          <td><span style="background: #E0E7FF; color: #3730A3; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">${requesterRole}</span></td>
        </tr>
        <tr>
          <td style="color: #64748B;"><strong>Requested At:</strong></td>
          <td style="color: #0F172A;">${requestedAt}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748B;">
      Please log in to the HealthPulse Administrator Portal to approve or decline this security request. Upon approval, an ephemeral 6-digit OTP will be dispatched to the user.
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
      <a href="${frontendUrl}/admin/password-requests" style="background-color: #0062CC; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Review Request Queue
      </a>
    </div>
  </div>
</body>
</html>`;

  const text = `Hello Administrator,\n\nA password reset request was logged for ${requesterName} (${requesterEmail}, Role: ${requesterRole}) at ${requestedAt}.\n\nPlease review in the Admin Dashboard: ${frontendUrl}/admin/password-requests\n\nHealthPulse Security`;

  return { subject, html, text };
};

module.exports = passwordRequestPending;
