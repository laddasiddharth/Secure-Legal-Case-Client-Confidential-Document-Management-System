const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'failed_login',
      'register',
      'case_created',
      'case_updated',
      'case_deleted',
      'document_uploaded',
      'document_downloaded',
      'document_signed',
      'document_verified',
      'user_created',
      'user_updated',
      'user_deleted',
      'role_changed',
      'unauthorized_access'
    ]
  },
  resourceType: {
    type: String,
    enum: ['user', 'case', 'document', 'system'],
    default: 'system'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
