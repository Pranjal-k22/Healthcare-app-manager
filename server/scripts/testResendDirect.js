const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { sendEmail } = require('../services/emailService');

async function testResendDirect() {
  console.log('--- HealthPulse Resend SDK Direct Email Dispatch Test ---');
  const recipient = process.env.TEST_EMAIL || 'delivered@resend.dev';
  console.log(`Target Recipient: ${recipient}`);

  const sampleData = {
    patientName: 'Test Patient',
    doctorName: 'Dr. Sarah Jenkins',
    specialisation: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 10:30 AM',
    fee: 150,
  };

  const result = await sendEmail({
    to: recipient,
    subject: 'HealthPulse Resend SDK Integration Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0062CC;">HealthPulse Resend SDK Test</h2>
        <p>Hello <strong>${sampleData.patientName}</strong>,</p>
        <p>This is a test notification dispatched via the <strong>Resend Node.js SDK</strong> over HTTPS API (port 443).</p>
        <div style="background-color: #f4f6f8; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> ${sampleData.doctorName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${sampleData.date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${sampleData.time}</p>
        </div>
        <p style="color: #666; font-size: 12px;">HealthPulse Hospital Management System &copy; 2026</p>
      </div>
    `,
    text: `HealthPulse Resend SDK Test - Hello ${sampleData.patientName}, your test email was delivered successfully!`,
    notificationType: 'bookingConfirmation',
    payload: sampleData,
    recipientName: sampleData.patientName,
    idempotencyKey: `healthpulse-resend-test-${Date.now()}`,
  });

  console.log('Dispatch Result:', JSON.stringify(result, null, 2));
  if (result.success) {
    console.log(`✓ Resend SDK test completed successfully! (Email ID: ${result.emailId || result.messageId})`);
  } else {
    console.log('❌ Resend SDK test failed:', result.error);
  }
}

if (require.main === module) {
  testResendDirect()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error in Resend direct test:', err);
      process.exit(1);
    });
}

module.exports = testResendDirect;
