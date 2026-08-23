const emailService = require('../services/emailService');

module.exports = {
  getTransporter: () => ({
    sendMail: async (mailOptions) => emailService.sendEmail(mailOptions),
    verify: async () => emailService.verifyTransporter(),
  }),
  verifyTransporter: emailService.verifyTransporter,
};
