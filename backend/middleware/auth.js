const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or header
    let token = req.cookies.token;
    
    if (!token && req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-passwordHash -privateKey -otp');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check account status
    if (user.accountStatus === 'locked' || user.accountStatus === 'suspended') {
      return res.status(403).json({ message: 'Account is locked or suspended' });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Check user role
const roleMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        // Log unauthorized access attempt
        await AuditLog.create({
          userId: req.user._id,
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resourceType: 'System',
          details: { 
            requiredRoles: allowedRoles, 
            userRole: req.user.role,
            path: req.path 
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Server error in authorization' });
    }
  };
};

module.exports = { authMiddleware, roleMiddleware };
