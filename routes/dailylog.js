const express = require("express");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const dailylogController = require("../controllers/dailylogController");

const router = express.Router();

// Routes for daily logs
router.get("/new", authenticateToken, dailylogController.renderNewLogForm);

router.post(
  "/new",
  authenticateToken,
  [
    body("date").notEmpty().isISO8601().withMessage("Invalid date format."),
    body("cardio")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cardio must be a non-negative integer."),
    body("pushups")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Pushups must be a non-negative integer."),
    body("situps")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Situps must be a non-negative integer."),
    body("savings")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Savings must be a non-negative number."),
  ],
  dailylogController.createOrUpdateLog
);

router.get("/", authenticateToken, dailylogController.getAllLogs);

router.get(
  "/:id/edit",
  authenticateToken,
  dailylogController.renderEditLogForm
);

router.put(
  "/:id",
  authenticateToken,
  [
    body("date").notEmpty().isISO8601().withMessage("Invalid date format."),
    body("cardio")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cardio must be a non-negative integer."),
    body("pushups")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Pushups must be a non-negative integer."),
    body("situps")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Situps must be a non-negative integer."),
    body("savings")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Savings must be a non-negative number."),
  ],
  dailylogController.updateLog
);

router.delete("/:id", authenticateToken, dailylogController.deleteLog);

module.exports = router;
