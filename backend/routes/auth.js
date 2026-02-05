const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Secure Case Management" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Login OTP - Secure Case Management",
    html: `
      <div style="font-family: 'Crimson Text', serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #e8e8e8; padding: 40px; border-radius: 8px;">
        <h1 style="color: #d4a574; text-align: center; margin-bottom: 30px;">🔐 Secure Case Management</h1>
        <p style="font-size: 18px; line-height: 1.6;">Your One-Time Password (OTP) for login is:</p>
        <div style="background: #2d2d2d; padding: 20px; text-align: center; border-radius: 4px; margin: 30px 0;">
          <h2 style="color: #d4a574; font-family: 'JetBrains Mono', monospace; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #b8b8b8;">This OTP will expire in <strong style="color: #d4a574;">5 minutes</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #b8b8b8;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
        <p style="font-size: 14px; color: #888; text-align: center;">Secure Legal Document Management System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, fullName, phoneNumber } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Prevent admin registration through public API
    if (role === "admin") {
      return res.status(403).json({
        message:
          "Admin accounts can only be created by existing administrators",
      });
    }

    // Validate role
    if (!["lawyer", "client"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be lawyer or client" });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username" });
    }

    // Generate RSA key pair for encryption
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
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
      accountStatus: "active",
    });

    await user.save();

    // Log registration
    await AuditLog.create({
      userId: user._id,
      action: "USER_REGISTERED",
      resourceType: "User",
      resourceId: user._id,
      details: { username, email, role },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and send OTP
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Log failed attempt
      await AuditLog.create({
        action: "LOGIN_FAILED",
        resourceType: "User",
        details: { email, reason: "User not found" },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check account status
    if (user.accountStatus === "locked") {
      return res
        .status(403)
        .json({ message: "Account is locked. Please contact administrator." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountStatus = "locked";
        await user.save();

        await AuditLog.create({
          userId: user._id,
          action: "ACCOUNT_LOCKED",
          resourceType: "User",
          resourceId: user._id,
          details: { reason: "Too many failed login attempts" },
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });

        return res
          .status(403)
          .json({ message: "Account locked due to too many failed attempts" });
      }

      await user.save();

      await AuditLog.create({
        userId: user._id,
        action: "LOGIN_FAILED",
        resourceType: "User",
        resourceId: user._id,
        details: {
          email,
          reason: "Invalid password",
          attempts: user.failedLoginAttempts,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      return res.status(401).json({
        message: `Invalid credentials. ${5 - user.failedLoginAttempts} attempts remaining.`,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email error:", emailError);
      return res
        .status(500)
        .json({
          message: "Failed to send OTP email. Please check SMTP configuration.",
        });
    }

    // Log OTP sent
    await AuditLog.create({
      userId: user._id,
      action: "OTP_SENT",
      resourceType: "User",
      resourceId: user._id,
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "OTP sent to your email",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return JWT
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Validation
    if (!userId || !otp) {
      return res.status(400).json({ message: "Please provide userId and OTP" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      await AuditLog.create({
        userId: user._id,
        action: "OTP_EXPIRED",
        resourceType: "User",
        resourceId: user._id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
      return res
        .status(400)
        .json({ message: "OTP has expired. Please login again." });
    }

    // Verify OTP
    if (user.otp !== otp) {
      await AuditLog.create({
        userId: user._id,
        action: "OTP_VERIFICATION_FAILED",
        resourceType: "User",
        resourceId: user._id,
        details: { providedOTP: otp },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    user.failedLoginAttempts = 0; // Reset failed attempts on successful login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Log successful login
    await AuditLog.create({
      userId: user._id,
      action: "LOGIN_SUCCESS",
      resourceType: "User",
      resourceId: user._id,
      details: { username: user.username, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // We just log the action for audit purposes

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      await AuditLog.create({
        userId: decoded.userId,
        action: "LOGOUT",
        resourceType: "User",
        resourceId: decoded.userId,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
});

module.exports = router;
