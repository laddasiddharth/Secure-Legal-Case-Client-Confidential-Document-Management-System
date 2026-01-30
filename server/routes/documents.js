const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const Document = require('../models/Document');
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Configure multer for file upload (memory storage for encryption)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document types by extension
    const allowedExtensions = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    
    // Allow common mimetypes
    const allowedMimeTypes = /pdf|msword|wordprocessingml|text\/plain|image\/jpeg|image\/png/;
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, JPG, PNG allowed.'));
  }
});

// AES-256-GCM Encryption
function encryptFile(buffer, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// AES-256-GCM Decryption
function decryptFile(encryptedData, key, iv, authTag) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
  
  return decrypted;
}

// Generate SHA-256 hash
function generateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// @route   POST /api/documents/upload
// @desc    Upload and encrypt document
// @access  Private (Lawyer, Admin only)
router.post('/upload', authMiddleware, roleMiddleware('lawyer', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { caseId, documentType, description } = req.body;

    if (!caseId) {
      return res.status(400).json({ message: 'Case ID is required' });
    }

    // Verify case exists and user has access
    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (req.user.role === 'lawyer' && caseData.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this case' });
    }

    // Generate encryption key (in production, use key management service)
    const encryptionKey = crypto.randomBytes(32);

    // Encrypt file
    const { encrypted, iv, authTag } = encryptFile(req.file.buffer, encryptionKey);

    // Generate hash of original file
    const fileHash = generateHash(req.file.buffer);

    // Create document record
    const document = new Document({
      caseId,
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType: documentType || 'other',
      description,
      encryptedData: encrypted.toString('base64'),
      encryptionIV: iv,
      authTag,
      encryptionKey: encryptionKey.toString('hex'), // In production, store in secure vault
      fileHash,
      isEncrypted: true
    });

    await document.save();

    // Update case with document reference
    caseData.documents.push(document._id);
    await caseData.save();

    // Log upload
    await AuditLog.create({
      userId: req.user._id,
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'Document',
      resourceId: document._id,
      details: {
        fileName: req.file.originalname,
        caseId,
        fileSize: req.file.size,
        encrypted: true
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and encrypted successfully',
      document: {
        id: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        fileHash: document.fileHash,
        uploadedAt: document.uploadedAt
      }
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error uploading document' });
  }
});

// @route   GET /api/documents/case/:caseId
// @desc    Get all documents for a case
// @access  Private
router.get('/case/:caseId', authMiddleware, async (req, res) => {
  try {
    // Verify case access
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const isAuthorized = 
      req.user.role === 'admin' ||
      caseData.lawyerId.toString() === req.user._id.toString() ||
      caseData.clientId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied to this case' });
    }

    const documents = await Document.find({ caseId: req.params.caseId })
      .populate('uploadedBy', 'fullName email')
      .select('-encryptedData -encryptionKey') // Don't send encrypted data in list
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download and decrypt document
// @access  Private
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('caseId');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    const caseData = await Case.findById(document.caseId);
    const isAuthorized = 
      req.user.role === 'admin' ||
      caseData.lawyerId.toString() === req.user._id.toString() ||
      caseData.clientId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'UNAUTHORIZED_DOCUMENT_ACCESS',
        resourceType: 'Document',
        resourceId: document._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(403).json({ message: 'Access denied to this document' });
    }

    // Decrypt file
    const encryptionKey = Buffer.from(document.encryptionKey, 'hex');
    const encryptedBuffer = Buffer.from(document.encryptedData, 'base64');
    
    const decrypted = decryptFile(
      encryptedBuffer,
      encryptionKey,
      document.encryptionIV,
      document.authTag
    );

    // Verify hash
    const downloadHash = generateHash(decrypted);
    if (downloadHash !== document.fileHash) {
      await AuditLog.create({
        userId: req.user._id,
        action: 'DOCUMENT_INTEGRITY_FAILED',
        resourceType: 'Document',
        resourceId: document._id,
        details: { reason: 'Hash mismatch' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(500).json({ message: 'Document integrity check failed' });
    }

    // Log download
    await AuditLog.create({
      userId: req.user._id,
      action: 'DOCUMENT_DOWNLOADED',
      resourceType: 'Document',
      resourceId: document._id,
      details: { fileName: document.fileName },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send file
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.send(decrypted);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Server error downloading document' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private (Lawyer, Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('lawyer', 'admin'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    const caseData = await Case.findById(document.caseId);
    if (req.user.role === 'lawyer' && caseData.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Remove from case
    await Case.findByIdAndUpdate(document.caseId, {
      $pull: { documents: document._id }
    });

    await document.deleteOne();

    // Log deletion
    await AuditLog.create({
      userId: req.user._id,
      action: 'DOCUMENT_DELETED',
      resourceType: 'Document',
      resourceId: document._id,
      details: { fileName: document.fileName },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

// @route   PATCH /api/documents/:id/sign
// @desc    Sign a document
// @access  Private (Lawyer only)
router.patch('/:id/sign', authMiddleware, roleMiddleware('lawyer'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Verify ownership/permission (only lawyer assigned to the case can sign)
    const caseData = await Case.findById(document.caseId);
    if (caseData.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to sign this document' });
    }

    if (document.isSigned) {
      return res.status(400).json({ message: 'Document is already signed' });
    }

    // In a real system, we would use the user's private key to sign the file hash
    // For this demo, we'll simulate the RSA signing process
    document.isSigned = true;
    document.signedBy = req.user._id;
    document.signedAt = new Date();
    document.signature = crypto.randomBytes(64).toString('hex'); // Simulated RSA-PSS signature

    await document.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'DOCUMENT_SIGNED',
      resourceType: 'Document',
      resourceId: document._id,
      details: { fileName: document.fileName, caseId: document.caseId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Document signed successfully',
      document
    });

  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({ message: 'Server error signing document' });
  }
});

module.exports = router;
