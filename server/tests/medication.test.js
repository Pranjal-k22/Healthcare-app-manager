const assert = require('assert');
const mongoose = require('mongoose');
const MedicationReminder = require('../models/MedicationReminder');
const {
  parseFrequencyToTimes,
  parseDurationToDays,
} = require('../services/medication/medicationScheduleService');

const runMedicationTests = async () => {
  console.log('\n--- [TEST SUITE 7] Medication Reminders & Adherence Scheduling ---');

  // 1. Frequency Parser Tests
  assert.deepStrictEqual(parseFrequencyToTimes('Once daily'), ['08:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('Twice daily'), ['08:00', '20:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('Three times daily'), ['08:00', '14:00', '20:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('Four times daily'), ['08:00', '12:00', '16:00', '20:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('Every 6 hours'), ['06:00', '12:00', '18:00', '00:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('Once at bedtime'), ['21:00']);
  assert.deepStrictEqual(parseFrequencyToTimes('09:00, 18:00'), ['09:00', '18:00']);
  console.log('✓ Frequency to discrete daily time slots mapping verified');

  // 2. Duration Parser Tests
  assert.strictEqual(parseDurationToDays('5 days'), 5);
  assert.strictEqual(parseDurationToDays('1 week'), 7);
  assert.strictEqual(parseDurationToDays('2 weeks'), 14);
  assert.strictEqual(parseDurationToDays('1 month'), 30);
  console.log('✓ Duration to active day counts parser verified');

  // 3. MedicationReminder Schema & Unique Idempotency Key
  assert.ok(MedicationReminder.schema.paths.patientId, 'Must have patientId');
  assert.ok(MedicationReminder.schema.paths.doctorId, 'Must have doctorId');
  assert.ok(MedicationReminder.schema.paths.prescriptionId, 'Must have prescriptionId');
  assert.ok(MedicationReminder.schema.paths.medicineName, 'Must have medicineName');
  assert.ok(MedicationReminder.schema.paths.dosage, 'Must have dosage');
  assert.ok(MedicationReminder.schema.paths.scheduledDate, 'Must have scheduledDate');
  assert.ok(MedicationReminder.schema.paths.scheduledTime, 'Must have scheduledTime');
  assert.ok(MedicationReminder.schema.paths.status, 'Must have status');

  const indexes = MedicationReminder.schema.indexes();
  const idempotencyIndex = indexes.find(
    (idx) => idx[1] && idx[1].unique === true
  );
  assert.ok(idempotencyIndex, 'MedicationReminder must have a compound unique idempotency index');
  assert.deepStrictEqual(idempotencyIndex[0], {
    prescriptionId: 1,
    medicineName: 1,
    scheduledDate: 1,
    scheduledTime: 1,
  });
  console.log('✓ Compound unique idempotency index for duplicate dose prevention verified');

  console.log('✓ [PASS] All Medication Reminders Tests Passed!');
};

module.exports = runMedicationTests;
if (require.main === module) {
  runMedicationTests().catch((err) => {
    console.error('Medication test failed:', err);
    process.exit(1);
  });
}
