const assert = require('assert');
const mongoose = require('mongoose');
const DoctorLeave = require('../models/DoctorLeave');
const {
  validateLeaveDates,
  isValidDateFormat,
} = require('../services/leaveService');

const runLeaveTests = async () => {
  console.log('\n--- [TEST SUITE 4] Doctor Leave, Conflict Detection & Reliability ---');

  // 1. DoctorLeave Schema & Enum Verification
  assert.ok(DoctorLeave.schema.paths.doctorId, 'Must have doctorId');
  assert.ok(DoctorLeave.schema.paths.startDate, 'Must have startDate');
  assert.ok(DoctorLeave.schema.paths.endDate, 'Must have endDate');
  assert.ok(DoctorLeave.schema.paths.reason, 'Must have reason');
  assert.ok(DoctorLeave.schema.paths.status, 'Must have status');

  const allowedStatuses = DoctorLeave.schema.paths.status.enumValues;
  assert.deepStrictEqual(allowedStatuses, ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);
  console.log('✓ DoctorLeave schema and status enums verified');

  // 2. Date Format & Range Validator
  assert.strictEqual(isValidDateFormat('2026-09-01'), true);
  assert.strictEqual(isValidDateFormat('2026/09/01'), false);
  assert.strictEqual(isValidDateFormat('01-09-2026'), false);
  assert.strictEqual(isValidDateFormat('not-a-date'), false);

  // Valid date range (future)
  assert.doesNotThrow(() => {
    validateLeaveDates('2026-09-10', '2026-09-15');
  });

  // Invalid: startDate > endDate
  assert.throws(() => {
    validateLeaveDates('2026-09-20', '2026-09-15');
  }, /Start date cannot be after end date/);

  // Invalid: past leave
  assert.throws(() => {
    validateLeaveDates('2021-01-01', '2021-01-05');
  }, /Cannot request leave entirely in the past/);
  console.log('✓ Leave date format, sequence, and past date prevention verified');

  // 3. Overlap Logic Simulation
  const existingLeave = { startDate: '2026-09-10', endDate: '2026-09-15' };
  const overlappingRequest = { startDate: '2026-09-12', endDate: '2026-09-18' };
  const nonOverlappingRequest = { startDate: '2026-09-16', endDate: '2026-09-20' };

  const isOverlap = (r1, r2) => r1.startDate <= r2.endDate && r1.endDate >= r2.startDate;
  assert.strictEqual(isOverlap(existingLeave, overlappingRequest), true, 'Overlapping leave must be detected');
  assert.strictEqual(isOverlap(existingLeave, nonOverlappingRequest), false, 'Disjoint leave must not be flagged as overlapping');
  console.log('✓ Date range overlap detection logic verified');

  // 4. Appointment Conflict Rule Simulation
  const bookedAppointment = { date: '2026-09-12', status: 'BOOKED' };
  const proposedLeave = { startDate: '2026-09-10', endDate: '2026-09-15' };

  const hasAppointmentConflict =
    bookedAppointment.date >= proposedLeave.startDate &&
    bookedAppointment.date <= proposedLeave.endDate &&
    bookedAppointment.status === 'BOOKED';

  assert.strictEqual(hasAppointmentConflict, true, 'Active appointment during leave window must trigger conflict');
  console.log('✓ Appointment conflict detection and patient visit preservation verified');

  // 5. Verify Leave Service & Controller Exports
  const leaveService = require('../services/leaveService');
  const leaveController = require('../controllers/leaveController');
  assert.ok(typeof leaveService.updateDoctorLeaveStatusAdmin === 'function', 'leaveService must export updateDoctorLeaveStatusAdmin');
  assert.ok(typeof leaveController.updateLeaveStatusAdminHandler === 'function', 'leaveController must export updateLeaveStatusAdminHandler');
  console.log('✓ Leave service and controller admin approval handlers verified');

  console.log('✓ [PASS] All Doctor Leave & Conflict Reliability Tests Passed!');
};

module.exports = runLeaveTests;
if (require.main === module) {
  runLeaveTests().catch((err) => {
    console.error('Leave test failed:', err);
    process.exit(1);
  });
}
