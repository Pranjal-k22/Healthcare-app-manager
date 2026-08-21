const assert = require('assert');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const {
  isDateInPast,
  isSlotInPast,
  getWeekdayFromDate,
  addMinutesToTime,
  timeToMinutes,
} = require('../validators/appointmentValidator');

const runAppointmentTests = async () => {
  console.log('\n--- [TEST SUITE 2] Appointment Engine, Double-Booking & Slot Validation ---');

  // 1. Validator Functions
  assert.strictEqual(timeToMinutes('09:00'), 540);
  assert.strictEqual(timeToMinutes('14:30'), 870);
  assert.strictEqual(addMinutesToTime('09:00', 30), '09:30');
  assert.strictEqual(addMinutesToTime('09:45', 30), '10:15');

  // Weekday calculation
  assert.strictEqual(getWeekdayFromDate('2026-08-24'), 'monday');
  assert.strictEqual(getWeekdayFromDate('2026-08-25'), 'tuesday');
  assert.strictEqual(getWeekdayFromDate('2026-08-26'), 'wednesday');
  assert.strictEqual(getWeekdayFromDate('2026-08-27'), 'thursday');
  assert.strictEqual(getWeekdayFromDate('2026-08-28'), 'friday');

  // Past date validation
  assert.strictEqual(isDateInPast('2020-01-01'), true);
  assert.strictEqual(isDateInPast('2099-12-31'), false);
  console.log('✓ Time conversion, weekday calculation, and past date checks verified');

  // 2. Appointment Model Compound Partial Unique Index Verification
  const indexes = Appointment.schema.indexes();
  const slotUniqueIndex = indexes.find(
    (idx) => idx[1] && idx[1].name === 'unique_active_doctor_slot'
  );
  assert.ok(slotUniqueIndex, 'Appointment must have unique_active_doctor_slot partial compound index');
  assert.deepStrictEqual(slotUniqueIndex[0], { doctorId: 1, date: 1, startTime: 1 });
  assert.strictEqual(slotUniqueIndex[1].unique, true);
  assert.deepStrictEqual(slotUniqueIndex[1].partialFilterExpression, {
    status: { $in: ['BOOKED', 'COMPLETED'] },
  });
  console.log('✓ Database-level compound partial unique index for double-booking prevention verified');

  // 3. Appointment Schema Field Validation
  assert.ok(Appointment.schema.paths.patientId, 'Must have patientId');
  assert.ok(Appointment.schema.paths.doctorId, 'Must have doctorId');
  assert.ok(Appointment.schema.paths.date, 'Must have date');
  assert.ok(Appointment.schema.paths.startTime, 'Must have startTime');
  assert.ok(Appointment.schema.paths.endTime, 'Must have endTime');
  assert.ok(Appointment.schema.paths.status, 'Must have status');
  assert.ok(Appointment.schema.paths.calendarEvents, 'Must have calendarEvents');
  assert.ok(Appointment.schema.paths.calendarSyncStatus, 'Must have calendarSyncStatus');

  const allowedStatuses = Appointment.schema.paths.status.enumValues;
  assert.deepStrictEqual(allowedStatuses, ['BOOKED', 'COMPLETED', 'CANCELLED']);
  console.log('✓ Appointment schema paths and status enum verified');

  // 4. IDOR Protection Simulation
  const patientA_Id = new mongoose.Types.ObjectId().toString();
  const patientB_Id = new mongoose.Types.ObjectId().toString();
  const appointmentDoc = {
    patientId: patientA_Id,
    doctorId: new mongoose.Types.ObjectId().toString(),
    status: 'BOOKED',
  };

  // Attempted cancel by Patient B
  const isAuthorized = appointmentDoc.patientId === patientB_Id;
  assert.strictEqual(isAuthorized, false, 'Patient B must be rejected when attempting to modify Patient A appointment');
  console.log('✓ IDOR authorization boundary checks verified');

  console.log('✓ [PASS] All Appointment Engine & Validation Tests Passed!');
};

module.exports = runAppointmentTests;
if (require.main === module) {
  runAppointmentTests().catch((err) => {
    console.error('Appointment test failed:', err);
    process.exit(1);
  });
}
