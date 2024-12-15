const express = require("express");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const dailylogController = require("../controllers/dailylogController");

const router = express.Router();

// Validation rules
const logValidationRules = [
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
];

// Middleware for handling validation errors and adding flash messages
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "error_msg",
      errors
        .array()
        .map((err) => err.msg)
        .join(", ")
    );
    return res.redirect(req.get("Referrer") || "/");
  }
  next();
};

// Routes for daily logs
router.get("/new", authenticateToken, dailylogController.renderNewLogForm);

router.post(
  "/new",
  authenticateToken,
  logValidationRules,
  handleValidationErrors,
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
  logValidationRules,
  handleValidationErrors,
  dailylogController.updateLog
);

router.delete("/:id", authenticateToken, dailylogController.deleteLog);

module.exports = router;
