const path = require('path');

// Ensure module resolution uses server/node_modules
const dotenv = require(path.join(__dirname, '../../server/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require(path.join(__dirname, '../../server/node_modules/mongoose'));
const config = require('../../server/config/env');
const User = require('../../server/models/User');
const DoctorProfile = require('../../server/models/DoctorProfile');
const Appointment = require('../../server/models/Appointment');
const Invoice = require('../../server/models/Invoice');
const Prescription = require('../../server/models/Prescription');
const ClinicalRecord = require('../../server/models/ClinicalRecord');
const SlotHold = require('../../server/models/SlotHold');
const DoctorResetRequest = require('../../server/models/DoctorResetRequest');

const cleanDatabase = async () => {
  try {
    console.log('[Cleanup] Connecting to MongoDB database...');
    await mongoose.connect(config.MONGO_URI);
    console.log('[Cleanup] ✓ Connected to MongoDB');

    // 1. Remove temporary test/supertest/junk accounts
    const deletedJunkUsers = await User.deleteMany({
      $or: [
        { email: /supertest/i },
        { email: /test.*@healthpulse/i },
        { email: /collagecontentmail/i },
        { name: /supertest/i }
      ]
    });
    console.log(`[Cleanup] ✓ Removed ${deletedJunkUsers.deletedCount} junk/test user accounts.`);

    // 2. Remove orphan doctor profiles without an existing user account
    const validUserIds = (await User.find({ role: 'DOCTOR' }).select('_id')).map(u => u._id);
    const deletedOrphanProfiles = await DoctorProfile.deleteMany({
      userId: { $nin: validUserIds }
    });
    console.log(`[Cleanup] ✓ Removed ${deletedOrphanProfiles.deletedCount} orphan doctor profiles.`);

    // 3. Remove orphan appointments, slot holds, and reset requests
    const allUserIds = (await User.find({}).select('_id')).map(u => u._id);
    const deletedOrphanAppointments = await Appointment.deleteMany({
      $or: [
        { patientId: { $nin: allUserIds } },
        { doctorId: { $nin: allUserIds } }
      ]
    });
    console.log(`[Cleanup] ✓ Removed ${deletedOrphanAppointments.deletedCount} orphan appointments.`);

    await SlotHold.deleteMany({ patientId: { $nin: allUserIds } });
    await DoctorResetRequest.deleteMany({ doctorId: { $nin: allUserIds } });

    console.log('====================================================');
    console.log('🎉 DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Cleanup] ❌ Database cleanup failed:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
