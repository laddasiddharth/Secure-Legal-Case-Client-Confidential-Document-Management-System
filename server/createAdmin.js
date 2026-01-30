require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'admin@legaldocs.com',
  password: 'Admin@SecureLegal2026',
  fullName: 'System Administrator',
  phoneNumber: '+1-555-0100',
  role: 'admin'
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_CREDENTIALS.email },
        { username: ADMIN_CREDENTIALS.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 Use the existing admin credentials or delete the user first.');
      process.exit(0);
    }

    console.log('\n🔐 Creating admin user...\n');

    // Generate RSA key pair
    console.log('🔑 Generating RSA-2048 key pair...');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Hash password
    console.log('🔒 Hashing password with bcrypt...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, salt);

    // Create admin user
    const adminUser = new User({
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      passwordHash,
      role: ADMIN_CREDENTIALS.role,
      fullName: ADMIN_CREDENTIALS.fullName,
      phoneNumber: ADMIN_CREDENTIALS.phoneNumber,
      publicKey,
      privateKey,
      accountStatus: 'active',
      failedLoginAttempts: 0
    });

    await adminUser.save();

    // Create audit log
    await AuditLog.create({
      userId: adminUser._id,
      action: 'ADMIN_USER_CREATED',
      resourceType: 'User',
      resourceId: adminUser._id,
      details: {
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        createdBy: 'System Script'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Creation Script'
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 ADMIN CREDENTIALS - SAVE THESE SECURELY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Username:     ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Email:        ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Password:     ${ADMIN_CREDENTIALS.password}`);
    console.log(`   Role:         ${ADMIN_CREDENTIALS.role}`);
    console.log(`   Full Name:    ${ADMIN_CREDENTIALS.fullName}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Change the password after first login');
    console.log('   2. Store these credentials in a secure location');
    console.log('   3. Do not share admin credentials');
    console.log('   4. Enable 2FA if available');
    console.log('\n🚀 You can now login at: http://localhost:8081/login');
    console.log('   - Enter email and password');
    console.log('   - Check email for OTP code');
    console.log('   - Access admin dashboard at: /admin/dashboard\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
