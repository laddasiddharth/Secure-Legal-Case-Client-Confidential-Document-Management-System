const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  caseType: {
    type: String,
    enum: ['civil', 'criminal', 'corporate', 'family', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed', 'archived'],
    default: 'open'
  },
  // Parties involved
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // QR Code for case verification
  qrCode: {
    type: String,
    default: null
  },
  // Dates
  filingDate: {
    type: Date,
    default: Date.now
  },
  hearingDate: {
    type: Date,
    default: null
  },
  closureDate: {
    type: Date,
    default: null
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
caseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', caseSchema);
