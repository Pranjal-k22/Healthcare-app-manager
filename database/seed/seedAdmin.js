const path = require('path');

// Ensure module resolution uses server/node_modules
const dotenv = require(path.join(__dirname, '../../server/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require(path.join(__dirname, '../../server/node_modules/mongoose'));
const config = require('../../server/config/env');
const User = require('../../server/models/User');

const seedAdmin = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('[Seed] MongoDB Connected.');

    const adminEmail = config.ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin already exists with email: ${adminEmail}`);
      console.log(`[Seed] Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: config.ADMIN_NAME,
      email: adminEmail,
      password: config.ADMIN_PASSWORD,
      role: 'ADMIN',
    });

    console.log('==============================================');
    console.log('🎉 Default Admin user seeded successfully!');
    console.log(`Name:     ${adminUser.name}`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`Password: ${config.ADMIN_PASSWORD}`);
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
