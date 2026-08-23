const config = require('../../config/env');

/**
 * OTP Verification Code Email Template sent to User upon Admin Approval
 */
const otpDelivery = (data) => {
  const { userName, otp, verifyUrl, expiresMinutes = 10 } = data;
  const subject = 'Your HealthPulse verification code';

  const contentHtml = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #3931AF;">
      Password Reset Verification Code
    </h2>
    <p style="margin: 0 0 16px 0;">Dear <strong>${userName}</strong>,</p>
    <p style="margin: 0 0 20px 0;">
      Your password reset request has been <strong>APPROVED</strong> by HealthPulse Administration. Use the 6-digit verification code below to set your new account password:
    </p>

    <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #EEF2FF; border: 2px dashed #6366F1; border-radius: 12px;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #312E81;">
        ${otp}
      </span>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #4338CA; font-weight: 600;">
        EXPIRES IN ${expiresMinutes} MINUTES
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${verifyUrl}" style="background-color: #0062CC; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
        Enter Code & Reset Password
      </a>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13.5px; color: #64748B;">
      <strong>Security Warning:</strong> Never share this verification code with anyone. HealthPulse staff will never ask for your code over email or phone.
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

  const text = `Dear ${userName},\n\nYour password reset verification code is: ${otp}\nThis code expires in ${expiresMinutes} minutes.\n\nReset your password here: ${verifyUrl}\n\nHealthPulse Security`;

  return { subject, html, text };
};

module.exports = otpDelivery;
