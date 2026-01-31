const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Case = require('../models/Case');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All routes require admin role
router.use(authMiddleware, roleMiddleware('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash -privateKey -otp')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Private (Admin only)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -privateKey -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's cases
    let cases = [];
    if (user.role === 'lawyer') {
      cases = await Case.find({ lawyerId: user._id }).select('caseNumber title status');
    } else if (user.role === 'client') {
      cases = await Case.find({ clientId: user._id }).select('caseNumber title status');
    }

    res.json({
      success: true,
      user,
      cases
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role, fullName, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      passwordHash,
      role,
      fullName,
      phoneNumber,
      publicKey,
      privateKey,
      accountStatus: 'active'
    });

    await user.save();

    // Log creation
    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_CREATED_BY_ADMIN',
      resourceType: 'User',
      resourceId: user._id,
      details: { username, email, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, phoneNumber, role, accountStatus } = req.body;

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;
    if (accountStatus) user.accountStatus = accountStatus;

    await user.save();

    // Log update
    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_UPDATED_BY_ADMIN',
      resourceType: 'User',
      resourceId: user._id,
      details: { updates: req.body },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   PUT /api/admin/users/:id/lock
// @desc    Lock/Unlock user account
// @access  Private (Admin only)
router.put('/users/:id/lock', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle lock status
    const newStatus = user.accountStatus === 'locked' ? 'active' : 'locked';
    user.accountStatus = newStatus;
    user.failedLoginAttempts = 0;

    await user.save();

    // Log action
    await AuditLog.create({
      userId: req.user._id,
      action: newStatus === 'locked' ? 'USER_LOCKED' : 'USER_UNLOCKED',
      resourceType: 'User',
      resourceId: user._id,
      details: { newStatus },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: `User ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully`,
      accountStatus: newStatus
    });

  } catch (error) {
    console.error('Lock user error:', error);
    res.status(500).json({ message: 'Server error locking/unlocking user' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.deleteOne();

    // Log deletion
    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_DELETED',
      resourceType: 'User',
      resourceId: user._id,
      details: { username: user.username, email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs
// @access  Private (Admin only)
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'fullName email role username')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const lawyers = await User.countDocuments({ role: 'lawyer' });
    const clients = await User.countDocuments({ role: 'client' });
    const admins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const lockedUsers = await User.countDocuments({ accountStatus: 'locked' });

    const totalCases = await Case.countDocuments();
    const activeCases = await Case.countDocuments({ status: 'open' });
    const closedCases = await Case.countDocuments({ status: 'closed' });

    const totalDocuments = await Document.countDocuments();

    const recentLogs = await AuditLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          lawyers,
          clients,
          admins,
          active: activeUsers,
          locked: lockedUsers
        },
        cases: {
          total: totalCases,
          active: activeCases,
          closed: closedCases
        },
        documents: {
          total: totalDocuments
        },
        auditLogs: {
          last30Days: recentLogs
        }
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
