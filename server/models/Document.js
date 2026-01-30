const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  documentType: {
    type: String,
    enum: ['evidence', 'judgment', 'petition', 'affidavit', 'other'],
    required: true
  },
  // Encrypted document data
  encryptedData: {
    type: String,
    required: true
  },
  // Encrypted AES key (encrypted with recipient's RSA public key)
  encryptedKey: {
    type: String,
    required: true
  },
  // Initialization Vector for AES
  iv: {
    type: String,
    required: true
  },
  // Document hash for integrity verification
  documentHash: {
    type: String,
    required: true
  },
  // Digital Signature
  signature: {
    type: String,
    default: null
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  signedAt: {
    type: Date,
    default: null
  },
  // File metadata
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  // Access control
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
