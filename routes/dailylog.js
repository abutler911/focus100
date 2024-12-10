const express = require("express");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");
const router = express.Router();

/**
 * Utility Function: Parse and Normalize Date
 * @param {string} dateString
 * @returns {Date}
 */
function parseAndNormalizeDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date)) throw new Error("Invalid date format");
  date.setHours(0, 0, 0, 0);
  return date;
}

// GET: Form to Add a New Log
router.get("/new", authenticateToken, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  console.log("Checking for existing log on:", today);

  const existingLog = await Dailylog.findOne({
    userId: req.user._id,
    date: today,
  });

  console.log("Existing log found:", existingLog);
  res.render("dailylog/new", {
    title: "New Log - Focus100",
    date: today,
    activePage: "dailylog",
  });
});

// POST: Create or Update a Log
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const logDate = parseAndNormalizeDate(req.body.date);
      const { cardio, pushups, situps, savings, noAlcohol } = req.body;

      let log = await Dailylog.findOne({ userId: req.user._id, date: logDate });

      if (log) {
        log.cardio += parseInt(cardio, 10) || 0;
        log.pushups += parseInt(pushups, 10) || 0;
        log.situps += parseInt(situps, 10) || 0;
        log.savings += parseFloat(savings) || 0;
        log.noAlcohol = log.noAlcohol && noAlcohol === "on";
        await log.save();
      } else {
        log = new Dailylog({
          userId: req.user._id,
          date: logDate,
          cardio: parseInt(cardio, 10) || 0,
          pushups: parseInt(pushups, 10) || 0,
          situps: parseInt(situps, 10) || 0,
          savings: parseFloat(savings) || 0,
          noAlcohol: noAlcohol === "on",
        });
        await log.save();
      }

      res.redirect("/dashboard");
    } catch (err) {
      console.error("Error creating or updating log:", err.message);
      res.status(500).json({ error: "Server Error. Please try again later." });
    }
  }
);

// GET: View All Logs
router.get("/", authenticateToken, async (req, res) => {
  try {
    const logs = await Dailylog.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.render("dailylog/index", { title: "Your Daily Logs", logs });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).send("Server Error");
  }
});

// GET: Form to Edit a Log
router.get("/:id/edit", authenticateToken, async (req, res) => {
  try {
    const log = await Dailylog.findById(req.params.id);
    if (!log || log.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this log." });
    }
    res.render("dailylog/edit", { title: "Edit Log", log });
  } catch (err) {
    console.error("Error fetching log for edit:", err);
    res.status(500).send("Server Error");
  }
});

// PUT: Update an Existing Log
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const parsedDate = parseAndNormalizeDate(req.body.date);
      const { cardio, pushups, situps, savings, noAlcohol } = req.body;

      const updatedLog = {
        cardio: parseInt(cardio, 10) || 0,
        pushups: parseInt(pushups, 10) || 0,
        situps: parseInt(situps, 10) || 0,
        savings: parseFloat(savings) || 0,
        noAlcohol: noAlcohol === "on",
        date: parsedDate,
      };

      const log = await Dailylog.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        updatedLog,
        { new: true }
      );

      if (!log) {
        return res.status(404).json({ error: "Log not found" });
      }

      res.redirect("/dailylog");
    } catch (err) {
      console.error("Error updating log:", err);
      res.status(500).json({ error: "Server Error. Please try again later." });
    }
  }
);

// DELETE: Delete a Log
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const log = await Dailylog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.redirect("/dailylog");
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ error: "Server Error. Please try again later." });
  }
});

module.exports = router;
