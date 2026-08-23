const nodemailer = require('nodemailer');
const dns = require('dns');
const config = require('./env');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Custom lookup function to force IPv4 DNS resolution (prevents ENETUNREACH on Render)
function forceIPv4Lookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { family: 4 }, callback);
}

let transporter = null;

/**
 * Initialize or return singleton Nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const user = config.GMAIL_USER || config.SMTP_USER;
  const pass = config.GMAIL_APP_PASSWORD || config.SMTP_PASS;

  if (config.ENABLE_EMAIL_NOTIFICATIONS && user && pass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,      // STARTTLS (port 587)
      requireTLS: true,
      family: 4,          // Force IPv4 socket — prevents ENETUNREACH on Render
      lookup: forceIPv4Lookup, // Force IPv4 DNS resolution for this transporter
      auth: {
        user,
        pass,
      },
    });
    console.log(`[EmailConfig] Nodemailer initialized with Gmail SMTP (${user})`);
  } else {
    // Development / Mock Transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(
          `[EmailService MOCK] [To: ${mailOptions.to}] [Subject: "${mailOptions.subject}"]`
        );
        return {
          messageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          accepted: [mailOptions.to],
        };
      },
      verify: async () => true,
    };
    console.log('[EmailConfig] Running in Development / Mock Mode (Emails logged to console)');
  }

  return transporter;
};

/**
 * Verify transporter at server startup without blocking
 */
const verifyTransporter = async () => {
  const activeTransporter = getTransporter();
  if (activeTransporter && typeof activeTransporter.verify === 'function') {
    try {
      await activeTransporter.verify();
      console.log('[EmailConfig] SMTP connection verified successfully with Gmail.');
      return true;
    } catch (error) {
      console.warn(
        `[EmailConfig] SMTP verification warning: ${error.message}. Check GMAIL_USER and GMAIL_APP_PASSWORD.`
      );
      return false;
    }
  }
  return true;
};

module.exports = {
  getTransporter,
  verifyTransporter,
};
