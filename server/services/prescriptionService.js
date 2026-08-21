const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const DoctorProfile = require('../models/DoctorProfile');
const ClinicalRecord = require('../models/ClinicalRecord');

/**
 * Get paginated list of prescriptions for a patient with status filter & text search
 * @param {string} patientId
 * @param {object} query - { status, search, page, limit }
 * @returns {Promise<{ prescriptions: Array, total: number, page: number, totalPages: number }>}
 */
const getPatientPrescriptions = async (patientId, query = {}) => {
  const { status, search, page = 1, limit = 20 } = query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (status && ['active', 'completed', 'expired'].includes(status.toLowerCase())) {
    filter.status = status.toLowerCase();
  }

  if (search && search.trim()) {
    const q = search.trim();
    // Search medication name or instructions
    filter.$or = [
      { 'medicines.name': { $regex: q, $options: 'i' } },
      { additionalInstructions: { $regex: q, $options: 'i' } },
    ];
  }

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'date startTime endTime reason status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Prescription.countDocuments(filter),
  ]);

  return {
    prescriptions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

/**
 * Get single prescription detail by ID (scoped strictly to patient)
 * @param {string} patientId
 * @param {string} prescriptionId
 * @returns {Promise<object>}
 */
const getPatientPrescriptionById = async (patientId, prescriptionId) => {
  if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
    const error = new Error('Prescription not found');
    error.statusCode = 404;
    throw error;
  }

  const prescription = await Prescription.findOne({
    _id: prescriptionId,
    patientId,
  })
    .populate('doctorId', 'name email')
    .populate('patientId', 'name email phone dateOfBirth address')
    .populate('appointmentId', 'date startTime endTime reason status');

  if (!prescription) {
    const error = new Error('Prescription not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch Doctor Profile for specialization & clinical credentials
  let doctorProfile = null;
  if (prescription.doctorId && prescription.doctorId._id) {
    doctorProfile = await DoctorProfile.findOne({ doctorId: prescription.doctorId._id });
  }

  // Fetch associated ClinicalRecord for diagnosis/instructions if available
  let clinicalRecord = null;
  if (prescription.appointmentId && prescription.appointmentId._id) {
    clinicalRecord = await ClinicalRecord.findOne({
      appointmentId: prescription.appointmentId._id,
    });
  }

  const result = prescription.toJSON();
  result.doctorProfile = doctorProfile
    ? {
        specialization: doctorProfile.specialization,
        qualifications: doctorProfile.qualifications,
        experienceYears: doctorProfile.experienceYears,
        clinicName: doctorProfile.clinicName,
      }
    : null;

  result.clinicalRecord = clinicalRecord
    ? {
        diagnosisNotes: clinicalRecord.diagnosisNotes,
        patientInstructions: clinicalRecord.patientInstructions,
        postVisitSummary: clinicalRecord.postVisitSummary,
      }
    : null;

  return result;
};

/**
 * Scheduled Daily Job: Update prescription status to 'completed' or 'expired' once duration has elapsed
 * @returns {Promise<number>} Number of updated prescriptions
 */
const updatePrescriptionStatuses = async () => {
  const now = new Date();

  // Find active prescriptions
  const activePrescriptions = await Prescription.find({ status: 'active' });
  let modifiedCount = 0;

  for (const rx of activePrescriptions) {
    const durationDays = rx.durationDays || 14;
    const expiryDate = new Date(rx.createdAt);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    if (now > expiryDate) {
      rx.status = 'completed';
      await rx.save();
      modifiedCount++;
    }
  }

  return modifiedCount;
};

module.exports = {
  getPatientPrescriptions,
  getPatientPrescriptionById,
  updatePrescriptionStatuses,
};
