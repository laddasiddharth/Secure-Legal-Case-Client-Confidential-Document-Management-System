const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const Document = require('../models/Document');
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const { pipeline } = require('stream');
const { promisify } = require('util');
const pipe = promisify(pipeline);
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { decryptMaster } = require('../utils/crypto');

// Configure multer for temp file upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// RSA Key Wrapping
function wrapKey(aesKey, publicKey) {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aesKey
  );
}

function unwrapKey(wrappedKey, privateKey) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    wrappedKey
  );
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

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (req.user.role === 'lawyer' && caseData.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this case' });
    }

    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

    const tempPath = req.file.path;
    const finalPath = path.join('uploads', `enc_${req.file.filename}`);
    
    // Create Hash stream to get file hash
    const hash = crypto.createHash('sha256');
    
    const readStream = fs.createReadStream(tempPath);
    const writeStream = fs.createWriteStream(finalPath);

    // Pipe through encryption and hash
    await new Promise((resolve, reject) => {
      readStream.on('data', (chunk) => hash.update(chunk));
      
      pipeline(readStream, cipher, writeStream, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const fileHash = hash.digest('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Key Wrapping (Hybrid Encryption)
    const accessKeys = [];
    const uploadingUser = await User.findById(req.user._id);
    
    // 1. Wrap for uploader (Lawyer/Admin)
    const uploaderWrappedKey = wrapKey(encryptionKey, uploadingUser.publicKey);
    accessKeys.push({
      userId: req.user._id,
      key: uploaderWrappedKey.toString('base64')
    });

    // 2. Wrap for Client (if exists and different from uploader)
    if (caseData.clientId && caseData.clientId.toString() !== req.user._id.toString()) {
      const clientUser = await User.findById(caseData.clientId);
      if (clientUser) {
        const clientWrappedKey = wrapKey(encryptionKey, clientUser.publicKey);
        accessKeys.push({
          userId: caseData.clientId,
          key: clientWrappedKey.toString('base64')
        });
      }
    }

    const document = new Document({
      caseId,
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType: documentType || 'other',
      description,
      filePath: finalPath,
      encryptionIV: iv.toString('hex'),
      authTag,
      accessKeys, // Store array of keys
      encryptionKey: uploaderWrappedKey.toString('base64'), // Legacy support
      fileHash,
      isEncrypted: true
    });

    await document.save();
    
    // Cleanup temp file
    fs.unlinkSync(tempPath);

    caseData.documents.push(document._id);
    await caseData.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded and encrypted securely',
      document: {
        id: document._id,
        fileName: document.fileName
      }
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
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
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const caseData = await Case.findById(document.caseId);
    const isAuthorized = 
      req.user.role === 'admin' ||
      caseData.lawyerId.toString() === req.user._id.toString() ||
      caseData.clientId.toString() === req.user._id.toString();

    if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

    // Key Unwrapping - Hybrid Decryption (Backend acts as agent)
    // Find the encrypted key for the requesting user
    let userKeyEntry = document.accessKeys?.find(k => k.userId.toString() === req.user._id.toString());
    
    // Fallback for Admin or legacy docs: specific logic or use uploader's key if authorized
    if (!userKeyEntry) {
      if (req.user.role === 'admin') {
         // Admins might not be in accessKeys list explicitly, try grabbing uploader's key? 
         // Realistically, for E2EE, Admins need their own key added during upload OR "break glass" using master key.
         // Here we assume if legacy/admin, we try to use the legacy encryptionKey if available, OR fail.
         // For the demo: if admin, use the uploader's key and impersonate via server master key (decrypt uploader private key).
         // BUT wait, server decrypts private key using Master Key. So server CAN impersonate uploader.
         const uploaderId = document.uploadedBy;
         // We'll use the legacy/uploader path below if userKeyEntry is missing but authorized
      }
    }

    // Determine whose private key to use
    let targetUserId = req.user._id;
    let targetWrappedKey = userKeyEntry ? userKeyEntry.key : null;

    if (!targetWrappedKey) {
       // Legacy Fallback or Admin Override
       if (document.encryptionKey) {
         targetWrappedKey = document.encryptionKey;
         targetUserId = document.uploadedBy; // Use uploader's key
       } else {
         return res.status(403).json({ message: 'No access key found for this user' });
       }
    }

    // Get the USER whose key we are using (could be self, or uploader if admin/legacy)
    const keyUser = await User.findById(targetUserId);
    
    // Decrypt the Private Key (Server-Side Managed)
    const decryptedPrivateKey = decryptMaster(keyUser.privateKey);

    const encryptionKey = unwrapKey(
      Buffer.from(targetWrappedKey, 'base64'),
      decryptedPrivateKey
    );

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      encryptionKey, 
      Buffer.from(document.encryptionIV, 'hex')
    );
    decipher.setAuthTag(Buffer.from(document.authTag, 'hex'));

    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

    const readStream = fs.createReadStream(document.filePath);
    pipeline(readStream, decipher, res, (err) => {
      if (err) {
        console.error('Streaming decryption failed:', err);
        if (!res.headersSent) res.status(500).send('Decryption failed');
      }
    });

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
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const caseData = await Case.findById(document.caseId);
    if (caseData.lawyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to sign this document' });
    }

    if (document.isSigned) return res.status(400).json({ message: 'Document is already signed' });

    // ACTUAL RSA-SHA256 DIGITAL SIGNATURE
    const signer = await User.findById(req.user._id);
    
    // Decrypt Signer's Private Key
    const decryptedPrivateKey = decryptMaster(signer.privateKey);
    
    const signature = crypto.sign(
      "sha256",
      Buffer.from(document.fileHash, "hex"),
      {
        key: decryptedPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      }
    );

    document.isSigned = true;
    document.signedBy = req.user._id;
    document.signedAt = new Date();
    document.signature = signature.toString('hex');

    await document.save();
    res.json({ success: true, message: 'Document signed with RSA-PSS', document });

  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({ message: 'Server error signing document' });
  }
});

module.exports = router;
