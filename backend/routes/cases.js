const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

// @route   GET /api/cases
// @desc    Get all cases (filtered by role)
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    let cases;

    if (req.user.role === "admin") {
      // Admin can see all cases
      cases = await Case.find()
        .populate("lawyerId", "fullName email")
        .populate("clientId", "fullName email")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "lawyer") {
      // Lawyer can see their assigned cases
      cases = await Case.find({ lawyerId: req.user._id })
        .populate("clientId", "fullName email")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "client") {
      // Client can only see their own cases
      cases = await Case.find({ clientId: req.user._id })
        .populate("lawyerId", "fullName email")
        .sort({ createdAt: -1 });
    }

    // Log access
    await AuditLog.create({
      userId: req.user._id,
      action: "CASES_VIEWED",
      resourceType: "Case",
      details: { count: cases.length, role: req.user.role },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    console.error("Get cases error:", error);
    res.status(500).json({ message: "Server error fetching cases" });
  }
});

// @route   GET /api/cases/:id
// @desc    Get single case
// @access  Private
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate("lawyerId", "fullName email phoneNumber")
      .populate("clientId", "fullName email phoneNumber");

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check authorization
    const isAuthorized =
      req.user.role === "admin" ||
      caseData.lawyerId._id.toString() === req.user._id.toString() ||
      caseData.clientId._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      await AuditLog.create({
        userId: req.user._id,
        action: "UNAUTHORIZED_CASE_ACCESS",
        resourceType: "Case",
        resourceId: caseData._id,
        details: { caseId: req.params.id },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });
      return res.status(403).json({ message: "Access denied to this case" });
    }

    // Log access
    await AuditLog.create({
      userId: req.user._id,
      action: "CASE_VIEWED",
      resourceType: "Case",
      resourceId: caseData._id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      case: caseData,
    });
  } catch (error) {
    console.error("Get case error:", error);
    res.status(500).json({ message: "Server error fetching case" });
  }
});

// @route   POST /api/cases
// @desc    Create new case
// @access  Private (Lawyer, Admin only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("lawyer", "admin"),
  async (req, res) => {
    try {
      const { title, description, caseType, clientId, priority } = req.body;

      // Validation
      if (!title || !description || !caseType || !clientId) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      // Verify client exists
      const client = await User.findById(clientId);
      if (!client || client.role !== "client") {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      // Generate unique case number
      const caseCount = await Case.countDocuments();
      const caseNumber = `CASE-${new Date().getFullYear()}-${String(caseCount + 1).padStart(3, "0")}`;

      // Create case
      const newCase = new Case({
        caseNumber,
        title,
        description,
        caseType,
        lawyerId: req.user._id,
        clientId,
        priority: priority || "medium",
        status: "open",
      });

      await newCase.save();

      // Populate for response
      await newCase.populate("lawyerId", "fullName email");
      await newCase.populate("clientId", "fullName email");

      // Log creation
      await AuditLog.create({
        userId: req.user._id,
        action: "CASE_CREATED",
        resourceType: "Case",
        resourceId: newCase._id,
        details: { caseNumber, title, clientId },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.status(201).json({
        success: true,
        message: "Case created successfully",
        case: newCase,
      });
    } catch (error) {
      console.error("Create case error:", error);
      res.status(500).json({ message: "Server error creating case" });
    }
  },
);

// @route   PUT /api/cases/:id
// @desc    Update case
// @access  Private (Lawyer, Admin only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("lawyer", "admin"),
  async (req, res) => {
    try {
      const caseData = await Case.findById(req.params.id);

      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Check if lawyer owns this case (admin can update any)
      if (
        req.user.role === "lawyer" &&
        caseData.lawyerId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this case" });
      }

      const { title, description, status, priority, notes } = req.body;

      // Update fields
      if (title) caseData.title = title;
      if (description) caseData.description = description;
      if (status) caseData.status = status;
      if (priority) caseData.priority = priority;
      if (notes) caseData.notes = notes;

      await caseData.save();

      // Log update
      await AuditLog.create({
        userId: req.user._id,
        action: "CASE_UPDATED",
        resourceType: "Case",
        resourceId: caseData._id,
        details: { updates: req.body },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json({
        success: true,
        message: "Case updated successfully",
        case: caseData,
      });
    } catch (error) {
      console.error("Update case error:", error);
      res.status(500).json({ message: "Server error updating case" });
    }
  },
);

// @route   DELETE /api/cases/:id
// @desc    Delete case
// @access  Private (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const caseData = await Case.findById(req.params.id);

      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }

      await caseData.deleteOne();

      // Log deletion
      await AuditLog.create({
        userId: req.user._id,
        action: "CASE_DELETED",
        resourceType: "Case",
        resourceId: caseData._id,
        details: { caseNumber: caseData.caseNumber, title: caseData.title },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.json({
        success: true,
        message: "Case deleted successfully",
      });
    } catch (error) {
      console.error("Delete case error:", error);
      res.status(500).json({ message: "Server error deleting case" });
    }
  },
);

// @route   GET /api/cases/stats/summary
// @desc    Get case statistics
// @access  Private
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "lawyer") {
      filter.lawyerId = req.user._id;
    } else if (req.user.role === "client") {
      filter.clientId = req.user._id;
    }

    const totalCases = await Case.countDocuments(filter);
    const activeCases = await Case.countDocuments({
      ...filter,
      status: "open",
    });
    const closedCases = await Case.countDocuments({
      ...filter,
      status: "closed",
    });
    const pendingCases = await Case.countDocuments({
      ...filter,
      status: "pending",
    });

    res.json({
      success: true,
      stats: {
        total: totalCases,
        active: activeCases,
        closed: closedCases,
        pending: pendingCases,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error fetching statistics" });
  }
});

// @route   GET /api/cases/clients
// @desc    Get all clients (for lawyers to assign cases)
// @access  Private (Lawyer, Admin only)
router.get(
  "/clients/list",
  authMiddleware,
  roleMiddleware("lawyer", "admin"),
  async (req, res) => {
    try {
      const clients = await User.find({ role: "client" })
        .select("fullName email username phoneNumber")
        .sort({ fullName: 1 });

      res.json({
        success: true,
        count: clients.length,
        clients,
      });
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Server error fetching clients" });
    }
  },
);

const QRCode = require("qrcode");

// @route   GET /api/cases/:id/qr
// @desc    Generate QR code for case verification
// @access  Private
router.get("/:id/qr", authMiddleware, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate("lawyerId", "fullName")
      .populate("clientId", "fullName");

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check authorization
    const isAuthorized =
      req.user.role === "admin" ||
      caseData.lawyerId._id.toString() === req.user._id.toString() ||
      caseData.clientId._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Data to be encoded in QR code
    const verificationData = {
      caseNumber: caseData.caseNumber,
      title: caseData.title,
      type: caseData.caseType,
      status: caseData.status,
      lawyer: caseData.lawyerId.fullName,
      client: caseData.clientId.fullName,
      verifiedAt: new Date(caseData.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }),
      system: "Secure Legal Case & Client Confidential DMS",
    };

    const qrDataString = JSON.stringify(verificationData);
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      color: {
        dark: "#d4a574", // Copper/Amber from theme
        light: "#0f0f0f", // Dark primary background
      },
      width: 300,
      margin: 2,
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      verificationData,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ message: "Server error generating QR code" });
  }
});

module.exports = router;
