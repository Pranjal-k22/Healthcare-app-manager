const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * Format populated doctor profile into clean flat response object
 * @param {object} profile - DoctorProfile document
 * @returns {object}
 */
const formatDoctorResponse = (profile) => {
  const user = profile.userId || {};
  return {
    id: profile._id,
    userId: user._id || profile.userId,
    name: user.name || 'Doctor',
    email: user.email || '',
    role: user.role || 'DOCTOR',
    specialization: profile.specialization,
    slotDuration: profile.slotDuration,
    workingHours: profile.workingHours,
    leaves: profile.leaves || [],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

/**
 * Create a new doctor user and linked doctor profile
 * @param {object} data - Doctor creation payload
 * @returns {Promise<object>}
 */
const createDoctor = async (data) => {
  const { name, email, password, specialization, slotDuration = 30, workingHours } = data;

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  let createdUser = null;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (sessErr) {
    // Standalone local MongoDB without replica set does not support transactions
    session = null;
  }

  try {
    if (session) {
      const userDocs = await User.create(
        [
          {
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: 'DOCTOR',
          },
        ],
        { session }
      );
      createdUser = userDocs[0];

      const profileDocs = await DoctorProfile.create(
        [
          {
            userId: createdUser._id,
            specialization: specialization.trim(),
            slotDuration,
            ...(workingHours && { workingHours }),
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const populatedProfile = await DoctorProfile.findById(profileDocs[0]._id).populate(
        'userId',
        'name email role'
      );
      return formatDoctorResponse(populatedProfile);
    } else {
      // Compensating rollback approach for non-replica set environments
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'DOCTOR',
      });

      let doctorProfile;
      try {
        doctorProfile = await DoctorProfile.create({
          userId: createdUser._id,
          specialization: specialization.trim(),
          slotDuration,
          ...(workingHours && { workingHours }),
        });
      } catch (profileError) {
        // Rollback: delete created user to prevent orphan doctor account
        await User.findByIdAndDelete(createdUser._id);
        throw profileError;
      }

      const populatedProfile = await DoctorProfile.findById(doctorProfile._id).populate(
        'userId',
        'name email role'
      );
      return formatDoctorResponse(populatedProfile);
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};

/**
 * Get all doctors with optional filters for specialization and search keyword
 * @param {object} query - { specialization, search }
 * @returns {Promise<Array>}
 */
const getAllDoctors = async (query = {}) => {
  const { specialization, search } = query;

  let profileFilter = {};
  if (specialization && typeof specialization === 'string' && specialization.trim()) {
    profileFilter.specialization = new RegExp(specialization.trim(), 'i');
  }

  const profiles = await DoctorProfile.find(profileFilter)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });

  let results = profiles
    .filter((p) => p.userId) // Ensure linked user exists
    .map(formatDoctorResponse);

  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    results = results.filter(
      (doc) => searchRegex.test(doc.name) || searchRegex.test(doc.specialization)
    );
  }

  return results;
};

/**
 * Get doctor by DoctorProfile ID or User ID
 * @param {string} id - Doctor Profile ID or User ObjectId
 * @returns {Promise<object>}
 */
const getDoctorById = async (id) => {
  let profile = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    profile = await DoctorProfile.findById(id).populate('userId', 'name email role');
    if (!profile) {
      profile = await DoctorProfile.findOne({ userId: id }).populate('userId', 'name email role');
    }
  }

  if (!profile || !profile.userId) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  return formatDoctorResponse(profile);
};

/**
 * Get doctor profile for the currently authenticated DOCTOR user
 * @param {string} userId - User ObjectId
 * @returns {Promise<object>}
 */
const getDoctorByUserId = async (userId) => {
  const profile = await DoctorProfile.findOne({ userId }).populate(
    'userId',
    'name email role'
  );

  if (!profile) {
    const error = new Error('Doctor profile for current user not found');
    error.statusCode = 404;
    throw error;
  }

  return formatDoctorResponse(profile);
};

/**
 * Update doctor profile and linked User information
 * @param {string} id - Doctor Profile ID
 * @param {object} updateData - { name, specialization, slotDuration, workingHours }
 * @returns {Promise<object>}
 */
const updateDoctor = async (id, updateData) => {
  let profile = await DoctorProfile.findById(id).populate('userId', 'name email role');

  if (!profile && mongoose.Types.ObjectId.isValid(id)) {
    profile = await DoctorProfile.findOne({ userId: id }).populate('userId', 'name email role');
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const { name, specialization, slotDuration, workingHours } = updateData;

  if (name && profile.userId) {
    await User.findByIdAndUpdate(profile.userId._id, { name: name.trim() });
  }

  if (specialization) profile.specialization = specialization.trim();
  if (slotDuration !== undefined) profile.slotDuration = slotDuration;
  if (workingHours) {
    profile.workingHours = {
      ...profile.workingHours.toObject(),
      ...workingHours,
    };
  }

  await profile.save();

  const updatedProfile = await DoctorProfile.findById(profile._id).populate(
    'userId',
    'name email role'
  );
  return formatDoctorResponse(updatedProfile);
};

/**
 * Add a leave date for a doctor
 * @param {string} id - Doctor Profile ID
 * @param {object} leaveData - { date, reason }
 * @returns {Promise<Array>} - Updated leaves array
 */
const addDoctorLeave = async (id, leaveData) => {
  const { date, reason } = leaveData;

  let profile = await DoctorProfile.findById(id);
  if (!profile && mongoose.Types.ObjectId.isValid(id)) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyOnLeave = profile.leaves.some((l) => l.date === date);
  if (alreadyOnLeave) {
    const error = new Error(`Doctor already has a leave scheduled on ${date}`);
    error.statusCode = 409;
    throw error;
  }

  profile.leaves.push({
    date,
    reason: reason ? reason.trim() : 'Unavailable',
  });

  // Sort leaves chronologically
  profile.leaves.sort((a, b) => a.date.localeCompare(b.date));

  await profile.save();
  return profile.leaves;
};

/**
 * Remove a scheduled leave date for a doctor
 * @param {string} id - Doctor Profile ID
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>} - Updated leaves array
 */
const removeDoctorLeave = async (id, date) => {
  let profile = await DoctorProfile.findById(id);
  if (!profile && mongoose.Types.ObjectId.isValid(id)) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const initialCount = profile.leaves.length;
  profile.leaves = profile.leaves.filter((l) => l.date !== date);

  if (profile.leaves.length === initialCount) {
    const error = new Error(`No scheduled leave found for date ${date}`);
    error.statusCode = 404;
    throw error;
  }

  await profile.save();
  return profile.leaves;
};

/**
 * Get all leaves for a doctor
 * @param {string} id - Doctor Profile ID
 * @returns {Promise<Array>}
 */
const getDoctorLeaves = async (id) => {
  let profile = await DoctorProfile.findById(id);
  if (!profile && mongoose.Types.ObjectId.isValid(id)) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  return profile.leaves || [];
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctor,
  addDoctorLeave,
  removeDoctorLeave,
  getDoctorLeaves,
};
