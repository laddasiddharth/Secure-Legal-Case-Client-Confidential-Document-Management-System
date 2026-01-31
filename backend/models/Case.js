const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  caseType: {
    type: String,
    required: true,
    enum: ['civil', 'criminal', 'corporate', 'family', 'property', 'intellectual-property', 'other']
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed', 'archived'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date,
    default: null
  }
});

// Update timestamp on save
caseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'closed' && !this.closedAt) {
    this.closedAt = Date.now();
  }
  next();
});

// Indexes for efficient querying
caseSchema.index({ lawyerId: 1, status: 1 });
caseSchema.index({ clientId: 1, status: 1 });
caseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Case', caseSchema);
