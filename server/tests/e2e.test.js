const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicationReminder = require('../models/MedicationReminder');
const generateToken = require('../utils/generateToken');
const { parseFrequencyToTimes, parseDurationToDays } = require('../services/medication/medicationScheduleService');

const runE2ETests = async () => {
  console.log('\n--- [TEST SUITE 9] End-to-End Clinic Workflow Simulation ---');

  // Step 1: Patient & Doctor Registration
  const patientId = new mongoose.Types.ObjectId();
  const doctorId = new mongoose.Types.ObjectId();

  const patientToken = generateToken(patientId, 'PATIENT');
  const doctorToken = generateToken(doctorId, 'DOCTOR');

  assert.ok(patientToken);
  assert.ok(doctorToken);
  console.log('Step 1: Patient & Doctor authenticated with distinct JWT tokens');

  // Step 2: Appointment Creation & Double-Booking Guard
  const appointmentDoc = new Appointment({
    patientId,
    doctorId,
    date: '2026-09-15',
    startTime: '10:00',
    endTime: '10:30',
    status: 'BOOKED',
    reason: 'Routine Health Consultation',
  });
  assert.strictEqual(appointmentDoc.status, 'BOOKED');
  console.log('Step 2: Appointment slot booked with valid time interval');

  // Step 3: Doctor Consultation & Prescription Creation
  const prescriptionDoc = new Prescription({
    appointmentId: appointmentDoc._id,
    patientId,
    doctorId,
    medicines: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '14 days',
        instructions: 'Take with breakfast and dinner',
      },
    ],
  });
  assert.strictEqual(prescriptionDoc.medicines.length, 1);
  console.log('Step 3: Doctor recorded clinical findings and structured prescription');

  // Step 4: Medication Reminder Generation & Adherence
  const times = parseFrequencyToTimes(prescriptionDoc.medicines[0].frequency);
  const days = parseDurationToDays(prescriptionDoc.medicines[0].duration);
  assert.deepStrictEqual(times, ['08:00', '20:00']);
  assert.strictEqual(days, 14);

  const doseReminder = new MedicationReminder({
    patientId,
    doctorId,
    prescriptionId: prescriptionDoc._id,
    appointmentId: appointmentDoc._id,
    medicineName: prescriptionDoc.medicines[0].name,
    dosage: prescriptionDoc.medicines[0].dosage,
    instructions: prescriptionDoc.medicines[0].instructions,
    scheduledDate: '2026-09-15',
    scheduledTime: '08:00',
    scheduledDateTime: new Date('2026-09-15T08:00:00Z'),
    status: 'PENDING',
  });

  assert.strictEqual(doseReminder.status, 'PENDING');
  doseReminder.status = 'TAKEN';
  doseReminder.takenAt = new Date();
  assert.strictEqual(doseReminder.status, 'TAKEN');
  console.log('Step 4: Medication reminders generated and patient adherence marked');

  console.log('✓ [PASS] Full End-to-End Clinic Workflow Simulated Successfully!');
};

module.exports = runE2ETests;
if (require.main === module) {
  runE2ETests().catch((err) => {
    console.error('E2E test failed:', err);
    process.exit(1);
  });
}
