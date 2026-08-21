const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const llmService = require('../services/llm/llmService');
const {
  validateClinicalRecordInput,
  validatePrescriptionInput,
} = require('../validators/clinicalValidator');
const {
  saveClinicalRecord,
  savePrescription,
  getClinicalRecordByAppointment,
  getPrescriptionByAppointment,
  getPatientPrescriptionsList,
  completeConsultation,
} = require('../services/clinicalService');

/**
 * @desc    Save or update clinical notes for an appointment
 * @route   POST /api/appointments/:appointmentId/clinical-record
 * @access  Private (DOCTOR, ADMIN)
 */
const saveClinicalRecordHandler = async (req, res, next) => {
  try {
    const validation = validateClinicalRecordInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const record = await saveClinicalRecord(
      req.params.appointmentId,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Clinical record saved successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get clinical record for an appointment
 * @route   GET /api/appointments/:appointmentId/clinical-record
 * @access  Private (Assigned Doctor, Owner Patient, ADMIN)
 */
const getClinicalRecordHandler = async (req, res, next) => {
  try {
    const record = await getClinicalRecordByAppointment(
      req.params.appointmentId,
      req.user
    );

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save or update structured prescription
 * @route   POST /api/appointments/:appointmentId/prescription
 * @access  Private (DOCTOR, ADMIN)
 */
const savePrescriptionHandler = async (req, res, next) => {
  try {
    const validation = validatePrescriptionInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const prescription = await savePrescription(
      req.params.appointmentId,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Prescription saved successfully',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prescription for an appointment
 * @route   GET /api/appointments/:appointmentId/prescription
 * @access  Private (Assigned Doctor, Owner Patient, ADMIN)
 */
const getPrescriptionHandler = async (req, res, next) => {
  try {
    const prescription = await getPrescriptionByAppointment(
      req.params.appointmentId,
      req.user
    );

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient's personal prescriptions list
 * @route   GET /api/prescriptions/my
 * @access  Private (PATIENT)
 */
const getMyPrescriptionsHandler = async (req, res, next) => {
  try {
    const prescriptions = await getPatientPrescriptionsList(
      req.user._id,
      req.user
    );

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete consultation workflow with clinical notes & prescription
 * @route   POST /api/appointments/:appointmentId/complete-consultation
 * @access  Private (DOCTOR, ADMIN)
 */
const completeConsultationHandler = async (req, res, next) => {
  try {
    if (req.body.clinicalNotes) {
      const notesValidation = validateClinicalRecordInput({
        clinicalNotes: req.body.clinicalNotes,
        diagnosisNotes: req.body.diagnosisNotes,
        patientInstructions: req.body.patientInstructions,
        followUpDate: req.body.followUpDate,
      });
      if (!notesValidation.valid) {
        return res.status(400).json({
          success: false,
          message: notesValidation.error,
        });
      }
    }

    if (req.body.medicines) {
      const rxValidation = validatePrescriptionInput({
        medicines: req.body.medicines,
        additionalInstructions: req.body.additionalInstructions,
      });
      if (!rxValidation.valid) {
        return res.status(400).json({
          success: false,
          message: rxValidation.error,
        });
      }
    }

    const result = await completeConsultation(
      req.params.appointmentId,
      req.user,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Consultation completed and clinical records finalized',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate Post-Visit AI Summary on-demand using Google Gemini
 * @route   POST /api/appointments/:appointmentId/generate-post-visit
 * @access  Private (DOCTOR, ADMIN)
 */
const generatePostVisitSummaryHandler = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { clinicalNotes, medicines = [] } = req.body;

    if (!clinicalNotes || !clinicalNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Clinical notes are required to generate post-visit summary',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Verify doctor ownership or admin
    if (appointment.doctorId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not the assigned doctor for this appointment',
      });
    }

    const result = await llmService.generatePostVisitSummary(clinicalNotes, medicines);

    if (result.status === 'READY' && result.data) {
      await Promise.all([
        Appointment.findByIdAndUpdate(appointmentId, {
          postVisitSummary: result.data,
          aiStatus: 'READY',
          aiPromptVersion: result.promptVersion,
        }),
        ClinicalRecord.findOneAndUpdate(
          { appointmentId },
          {
            postVisitSummary: result.data,
            aiStatus: 'READY',
            aiPromptVersion: result.promptVersion,
          },
          { upsert: false }
        ),
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        postVisitSummary: result.data,
        aiStatus: result.status,
        promptVersion: result.promptVersion,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveClinicalRecordHandler,
  getClinicalRecordHandler,
  savePrescriptionHandler,
  getPrescriptionHandler,
  getMyPrescriptionsHandler,
  completeConsultationHandler,
  generatePostVisitSummaryHandler,
};
