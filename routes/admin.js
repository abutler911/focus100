const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const adminController = require("../controllers/adminController");

// Apply global middleware to all routes in this router
router.use(authenticateToken);
router.use(isAdmin);

// Admin dashboard
router.get("/", adminController.getAdminDashboard);

// Approve a user
router.post("/approve/:id", adminController.approveUser);

// Grant admin privileges
router.post("/grant-admin/:id", adminController.grantAdminPrivileges);

module.exports = router;
