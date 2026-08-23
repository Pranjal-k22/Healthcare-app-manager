const config = require('../../config/env');

/**
 * Neutral Denial Email Notice sent to Doctor if Admin Denies Reset Request
 */
const doctorResetDenied = (data) => {
  const { doctorName } = data;
  const subject = 'HealthPulse Password Reset Request Update';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #DC2626;">
      Password Reset Request Status
    </h2>
    <p style="margin: 0 0 16px 0;">Dear <strong>Dr. ${doctorName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">
      Your recent password reset application could not be processed by Hospital Administration at this time.
    </p>

    <div style="background-color: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 10px; padding: 20px; margin-bottom: 24px; color: #991B1B;">
      <p style="margin: 0; font-size: 14px; line-height: 22px;">
        If you require immediate assistance recovering access to your Doctor Portal, please contact Hospital System Administration directly.
      </p>
    </div>

    <p style="margin: 0; font-size: 13.5px; color: #64748B;">
      HealthPulse Clinical Systems Security
    </p>
  `;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #F8FAFC; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #E2E8F0;">
    ${contentHtml}
  </div>
</body>
</html>`;

  const text = `Dear Dr. ${doctorName},\n\nYour password reset application could not be processed by Hospital Administration. Please contact System Administration directly if you require account recovery.\n\nHealthPulse Security`;

  return { subject, html, text };
};

module.exports = doctorResetDenied;
