const express = require("express");
const authenticateToken = require("../middleware/auth");
const summaryController = require("../controllers/summaryController");

const router = express.Router();

// Define the summary route
router.get("/", authenticateToken, summaryController.renderSummary);

module.exports = router;
