const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['lawyer', 'client', 'admin'],
    required: true,
    default: 'client'
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  // RSA Key Pair for encryption
  publicKey: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  // MFA - OTP
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  // Security
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountStatus: {
    type: String,
    enum: ['active', 'locked', 'suspended'],
    default: 'active'
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
