const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  documentType: {
    type: String,
    enum: ['evidence', 'contract', 'agreement', 'certificate', 'report', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    default: ''
  },
  // Encryption fields
  filePath: {
    type: String,
    required: true
  },
  encryptionIV: {
    type: String,
    required: true
  },
  authTag: {
    type: String,
    required: true
  },
  // Hybrid Encryption Keys (Wrapped AES Key for each authorized user)
  accessKeys: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    key: {
      type: String, // Encrypted AES key (wrapped with user's public key)
      required: true
    }
  }],
  encryptionKey: { type: String }, // Legacy/Fallback (optional)
  fileHash: {
    type: String,
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  // Digital signature fields (for future implementation)
  isSigned: {
    type: Boolean,
    default: false
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  signedAt: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
documentSchema.index({ caseId: 1, uploadedAt: -1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ fileHash: 1 });

module.exports = mongoose.model('Document', documentSchema);
