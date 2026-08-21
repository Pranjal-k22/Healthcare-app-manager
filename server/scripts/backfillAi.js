const mongoose = require('mongoose');
const config = require('../config/env');
const Appointment = require('../models/Appointment');
const llmService = require('../services/llm/llmService');

(async () => {
  await mongoose.connect(config.MONGO_URI);
  const appointments = await Appointment.find({
    aiStatus: { $in: ['FAILED', 'PENDING'] },
    symptoms: { $exists: true, $ne: '' },
  });

  console.log(`Sequentially processing ${appointments.length} appointments with Local LLM...`);

  for (const app of appointments) {
    console.log(`\nSynthesizing pre-visit summary for ID ${app._id} (symptoms: "${app.symptoms}")...`);
    try {
      const result = await llmService.generatePreVisitSummary(app.symptoms);
      if (result.status === 'READY') {
        app.preVisitSummary = result.data;
        app.aiStatus = 'READY';
        app.aiPromptVersion = result.promptVersion;
        await app.save();
        console.log(`✓ Appointment ${app._id} updated to READY!`);
      } else {
        console.log(`✗ Appointment ${app._id} result status: ${result.status}`);
      }
    } catch (err) {
      console.error(`Error processing ${app._id}:`, err.message);
    }
  }

  console.log('\n✅ All appointments updated with AI summaries!');
  process.exit(0);
})();
