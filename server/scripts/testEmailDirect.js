const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const { sendEmail } = require('../services/emailService');
const emailTemplates = require('../services/emailTemplates');

async function testDirectEmail() {
  console.log('--- HealthPulse Direct Email Dispatch Test ---');
  await connectDB();
  const recipient = process.env.TEST_EMAIL || process.env.GMAIL_USER || 'test@healthpulse.com';
  console.log(`Target Recipient: ${recipient}`);

  const sampleData = {
    recipientName: 'Test Patient',
    recipientRole: 'PATIENT',
    doctorName: 'Sarah Jenkins',
    patientName: 'Test Patient',
    specialisation: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 10:30 AM',
    fee: 150,
    appointmentId: 'DIRECT-TEST-001',
  };

  const rendered = emailTemplates.bookingConfirmation(sampleData);

  const result = await sendEmail({
    to: recipient,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    notificationType: 'bookingConfirmation',
    payload: sampleData,
    recipientName: 'Test Patient',
  });

  console.log('Dispatch Result:', JSON.stringify(result, null, 2));
  if (result.success) {
    console.log('✓ Direct email test completed successfully!');
  } else {
    console.log('❌ Direct email test failed:', result.error);
  }
}

if (require.main === module) {
  testDirectEmail()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error in direct email test:', err);
      process.exit(1);
    });
}

module.exports = testDirectEmail;
