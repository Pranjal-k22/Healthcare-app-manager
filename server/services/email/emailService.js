const nodemailer = require('nodemailer');
const config = require('../../config/env');

let transporter = null;

/**
 * Initialize or return nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  if (config.ENABLE_EMAIL_NOTIFICATIONS && config.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  } else {
    // Development fallback mock transport
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`[EmailService MOCK] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  return transporter;
};

/**
 * Send an email with retry support and non-blocking safety
 * @param {object} options - { to, subject, html, text }
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<boolean>}
 */
const sendEmail = async ({ to, subject, html, text }, maxRetries = 3) => {
  if (!to) {
    console.warn('[EmailService] Attempted to send email without recipient address');
    return false;
  }

  const mailOptions = {
    from: config.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const activeTransporter = getTransporter();
      const info = await activeTransporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully (Attempt ${attempt}/${maxRetries}): ${info.messageId || 'OK'}`);
      return true;
    } catch (error) {
      console.error(`[EmailService] Attempt ${attempt}/${maxRetries} failed to send email to ${to}: ${error.message}`);
      if (attempt < maxRetries) {
        // Wait briefly before retrying (exponential backoff 300ms, 600ms...)
        await new Promise((res) => setTimeout(res, attempt * 300));
      }
    }
  }

  console.error(`[EmailService] All ${maxRetries} attempts to send email to ${to} failed.`);
  return false;
};

module.exports = {
  sendEmail,
  getTransporter,
};
