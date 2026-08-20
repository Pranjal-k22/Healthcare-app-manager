const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Prescription = require('../models/Prescription');
const { dispatchPrescriptionAvailable } = require('./notificationService');
const {
  generateRemindersForPrescription,
} = require('./medication/medicationScheduleService');
const { generatePostVisitSummary } = require('./llm/llmService');

/**
 * Save or update clinical notes for an appointment (Doctor authority)
 * @param {string} appointmentId
 * @param {object} data - { clinicalNotes, diagnosisNotes, patientInstructions, followUpDate }
 * @param {object} doctorUser - Authenticated doctor user
 * @returns {Promise<object>}
 */
const saveClinicalRecord = async (appointmentId, data, doctorUser) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify doctor ownership
  if (appointment.doctorId.toString() !== doctorUser._id.toString() && doctorUser.role !== 'ADMIN') {
    const error = new Error('Access denied: You are not the assigned doctor for this appointment');
    error.statusCode = 403;
    throw error;
  }

  // Prevent modifying cancelled appointment
  if (appointment.status === 'CANCELLED') {
    const error = new Error('Cannot add clinical records to a cancelled appointment');
    error.statusCode = 400;
    throw error;
  }

  const { clinicalNotes, diagnosisNotes, patientInstructions, followUpDate } = data;

  const record = await ClinicalRecord.findOneAndUpdate(
    { appointmentId },
    {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      clinicalNotes: clinicalNotes.trim(),
      ...(diagnosisNotes !== undefined && { diagnosisNotes: diagnosisNotes.trim() }),
      ...(patientInstructions !== undefined && { patientInstructions: patientInstructions.trim() }),
      ...(followUpDate !== undefined && { followUpDate: followUpDate || null }),
    },
    { new: true, upsert: true, runValidators: true }
  );

  return record;
};

/**
 * Save or update structured prescription for an appointment (Doctor authority)
 * @param {string} appointmentId
 * @param {object} data - { medicines, additionalInstructions }
 * @param {object} doctorUser - Authenticated doctor user
 * @returns {Promise<object>}
 */
const savePrescription = async (appointmentId, data, doctorUser) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify doctor ownership
  if (appointment.doctorId.toString() !== doctorUser._id.toString() && doctorUser.role !== 'ADMIN') {
    const error = new Error('Access denied: You are not the assigned doctor for this appointment');
    error.statusCode = 403;
    throw error;
  }

  // Prevent modifying cancelled appointment
  if (appointment.status === 'CANCELLED') {
    const error = new Error('Cannot create prescription for a cancelled appointment');
    error.statusCode = 400;
    throw error;
  }

  const { medicines = [], additionalInstructions = '' } = data;

  const prescription = await Prescription.findOneAndUpdate(
    { appointmentId },
    {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      medicines: medicines.map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        duration: m.duration.trim(),
        instructions: (m.instructions || 'Take with water after meals').trim(),
      })),
      additionalInstructions: additionalInstructions.trim(),
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Asynchronously dispatch prescription notification for patient (Non-blocking)
  dispatchPrescriptionAvailable(prescription, appointment).catch((err) => {
    console.error('[Notification] dispatchPrescriptionAvailable error:', err.message);
  });

  // Asynchronously generate discrete medication reminders (Non-blocking)
  generateRemindersForPrescription(prescription._id).catch((err) => {
    console.error('[MedicationReminder] Failed to generate reminders:', err.message);
  });

  return prescription;
};

/**
 * Retrieve clinical record for an appointment with ownership verification
 * @param {string} appointmentId
 * @param {object} requestingUser
 * @returns {Promise<object>}
 */
const getClinicalRecordByAppointment = async (appointmentId, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isPatient = appointment.patientId.toString() === requestingUser._id.toString();
  const isDoctor = appointment.doctorId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isPatient && !isDoctor && !isAdmin) {
    const error = new Error('Access denied: You are not authorized to view this clinical record');
    error.statusCode = 403;
    throw error;
  }

  const record = await ClinicalRecord.findOne({ appointmentId })
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  if (!record) {
    return null;
  }

  return record;
};

/**
 * Retrieve prescription for an appointment with ownership verification
 * @param {string} appointmentId
 * @param {object} requestingUser
 * @returns {Promise<object>}
 */
const getPrescriptionByAppointment = async (appointmentId, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isPatient = appointment.patientId.toString() === requestingUser._id.toString();
  const isDoctor = appointment.doctorId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isPatient && !isDoctor && !isAdmin) {
    const error = new Error('Access denied: You are not authorized to view this prescription');
    error.statusCode = 403;
    throw error;
  }

  const prescription = await Prescription.findOne({ appointmentId })
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  return prescription;
};

/**
 * Get all prescriptions for a patient
 * @param {string} patientId
 * @param {object} requestingUser
 * @returns {Promise<Array>}
 */
const getPatientPrescriptionsList = async (patientId, requestingUser) => {
  const isSelf = patientId.toString() === requestingUser._id.toString();
  const isDoctorOrAdmin = ['DOCTOR', 'ADMIN'].includes(requestingUser.role);

  if (!isSelf && !isDoctorOrAdmin) {
    const error = new Error('Access denied: You can only view your own prescriptions');
    error.statusCode = 403;
    throw error;
  }

  const prescriptions = await Prescription.find({ patientId })
    .populate('doctorId', 'name email')
    .populate('appointmentId', 'date startTime endTime reason')
    .sort({ createdAt: -1 });

  return prescriptions;
};

/**
 * Complete consultation workflow: validates clinical record presence, saves data, and marks appointment COMPLETED
 * @param {string} appointmentId
 * @param {object} doctorUser
 * @param {object} workflowData - { clinicalNotes, diagnosisNotes, patientInstructions, followUpDate, medicines, additionalInstructions }
 * @returns {Promise<object>}
 */
const completeConsultation = async (appointmentId, doctorUser, workflowData = {}) => {
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  if (appointment.doctorId.toString() !== doctorUser._id.toString() && doctorUser.role !== 'ADMIN') {
    const error = new Error('Access denied: Only the assigned doctor can complete this consultation');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status === 'CANCELLED') {
    const error = new Error('Cannot complete a cancelled appointment');
    error.statusCode = 400;
    throw error;
  }

  // 1. Save or update Clinical Notes if provided in payload
  if (workflowData.clinicalNotes) {
    await saveClinicalRecord(
      appointmentId,
      {
        clinicalNotes: workflowData.clinicalNotes,
        diagnosisNotes: workflowData.diagnosisNotes,
        patientInstructions: workflowData.patientInstructions,
        followUpDate: workflowData.followUpDate,
      },
      doctorUser
    );
  }

  // 2. Save or update Prescription if provided
  if (workflowData.medicines && Array.isArray(workflowData.medicines) && workflowData.medicines.length > 0) {
    await savePrescription(
      appointmentId,
      {
        medicines: workflowData.medicines,
        additionalInstructions: workflowData.additionalInstructions,
      },
      doctorUser
    );
  }

  // 3. Mark appointment as COMPLETED
  appointment.status = 'COMPLETED';
  await appointment.save();

  const [clinicalRecord, prescription] = await Promise.all([
    ClinicalRecord.findOne({ appointmentId }),
    Prescription.findOne({ appointmentId }),
  ]);

  // Asynchronously trigger Post-Visit LLM summary generation (Non-blocking)
  if (clinicalRecord && clinicalRecord.clinicalNotes) {
    const medicines = prescription ? prescription.medicines : [];
    generatePostVisitSummary(
      clinicalRecord._id,
      appointmentId,
      clinicalRecord.clinicalNotes,
      medicines
    ).catch((err) => {
      console.error('[LLMService] Post-visit generation error:', err.message);
    });
  }

  return {
    appointment,
    clinicalRecord,
    prescription,
  };
};

module.exports = {
  saveClinicalRecord,
  savePrescription,
  getClinicalRecordByAppointment,
  getPrescriptionByAppointment,
  getPatientPrescriptionsList,
  completeConsultation,
};
