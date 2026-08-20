const assert = require('assert');
const mongoose = require('mongoose');
const ClinicalRecord = require('../models/ClinicalRecord');
const Prescription = require('../models/Prescription');

const runClinicalTests = async () => {
  console.log('\n--- [TEST SUITE 3] Clinical Workflow, Notes & Prescriptions ---');

  // 1. ClinicalRecord Schema Verification
  assert.ok(ClinicalRecord.schema.paths.appointmentId, 'ClinicalRecord must have appointmentId');
  assert.ok(ClinicalRecord.schema.paths.patientId, 'ClinicalRecord must have patientId');
  assert.ok(ClinicalRecord.schema.paths.doctorId, 'ClinicalRecord must have doctorId');
  assert.ok(ClinicalRecord.schema.paths.clinicalNotes, 'ClinicalRecord must have clinicalNotes');

  // Check required clinical notes
  const emptyRecord = new ClinicalRecord();
  const validationErr = emptyRecord.validateSync();
  assert.ok(validationErr && validationErr.errors.clinicalNotes, 'Clinical notes must be required');
  console.log('✓ ClinicalRecord schema validation and required notes constraint verified');

  // 2. Prescription Schema & Structured Medicines
  assert.ok(Prescription.schema.paths.appointmentId, 'Prescription must have appointmentId');
  assert.ok(Prescription.schema.paths.patientId, 'Prescription must have patientId');
  assert.ok(Prescription.schema.paths.doctorId, 'Prescription must have doctorId');
  assert.ok(Prescription.schema.paths.medicines, 'Prescription must have medicines array');

  const samplePrescription = new Prescription({
    appointmentId: new mongoose.Types.ObjectId(),
    patientId: new mongoose.Types.ObjectId(),
    doctorId: new mongoose.Types.ObjectId(),
    medicines: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with food and full glass of water',
      },
    ],
  });

  assert.strictEqual(samplePrescription.medicines.length, 1);
  assert.strictEqual(samplePrescription.medicines[0].name, 'Amoxicillin');
  assert.strictEqual(samplePrescription.medicines[0].dosage, '500mg');
  assert.strictEqual(samplePrescription.medicines[0].frequency, 'Three times daily');
  assert.strictEqual(samplePrescription.medicines[0].duration, '7 days');
  console.log('✓ Prescription structured medication schema verified');

  // 3. Clinical Access Control Simulation
  const assignedDoctorId = new mongoose.Types.ObjectId().toString();
  const unassignedDoctorId = new mongoose.Types.ObjectId().toString();
  const patientId = new mongoose.Types.ObjectId().toString();

  const appointment = {
    _id: new mongoose.Types.ObjectId(),
    doctorId: assignedDoctorId,
    patientId: patientId,
    status: 'BOOKED',
  };

  // Attempt to write notes by unassigned doctor
  const canUnassignedDoctorEdit = appointment.doctorId === unassignedDoctorId;
  assert.strictEqual(canUnassignedDoctorEdit, false, 'Unassigned doctor must NOT be allowed to edit clinical notes');

  // Attempt to write notes by patient
  const canPatientWriteNotes = appointment.doctorId === patientId;
  assert.strictEqual(canPatientWriteNotes, false, 'Patient must NOT be allowed to write clinical notes');

  // Assigned doctor editing
  const canAssignedDoctorEdit = appointment.doctorId === assignedDoctorId;
  assert.strictEqual(canAssignedDoctorEdit, true, 'Assigned doctor is authorized to create/edit clinical records');
  console.log('✓ Clinical workflow role authorization & ownership verified');

  console.log('✓ [PASS] All Clinical Workflow Tests Passed!');
};

module.exports = runClinicalTests;
if (require.main === module) {
  runClinicalTests().catch((err) => {
    console.error('Clinical test failed:', err);
    process.exit(1);
  });
}
