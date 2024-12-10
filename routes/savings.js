const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Savings = require("../models/Savings");

// GET: Render Savings Page
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Fetch all savings entries for the user, sorted by day
    const savingsEntries = await Savings.find({ userId: req.user._id }).sort(
      "day"
    );

    // Calculate the total amount saved
    const totalSaved = savingsEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    res.render("savings", {
      title: "100 Days of Saving",
      user: req.user,
      savingsEntries,
      totalSaved,
    });
  } catch (err) {
    console.error(`Error fetching savings data for user ${req.user._id}:`, err);
    res.status(500).send("Server Error");
  }
});

// POST: Update Savings Entry
router.post(
  "/update",
  authenticateToken,
  [
    body("day")
      .isInt({ min: 1, max: 100 })
      .withMessage("Day must be between 1 and 100."),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number."),
    body("action")
      .isIn(["add", "remove"])
      .withMessage("Action must be either 'add' or 'remove'."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { day, amount, action } = req.body;

    try {
      if (action === "add") {
        // Check if the savings entry for the day already exists
        const existingEntry = await Savings.findOne({
          userId: req.user._id,
          day,
        });

        if (existingEntry) {
          // Update the existing entry's amount
          existingEntry.amount += parseFloat(amount);
          await existingEntry.save();
        } else {
          // Create a new savings entry
          await Savings.create({ userId: req.user._id, day, amount });
        }
      } else if (action === "remove") {
        // Remove the savings entry for the specified day
        await Savings.deleteOne({ userId: req.user._id, day });
      }

      // Recalculate the total amount saved
      const savingsEntries = await Savings.find({ userId: req.user._id });
      const totalSaved = savingsEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );

      res.status(200).json({ success: true, totalSaved });
    } catch (err) {
      console.error(
        `Error updating savings entry for user ${req.user._id}:`,
        err
      );
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

// POST: Reset Savings Data
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    // Delete all savings entries for the user
    await Savings.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: "Savings data reset." });
  } catch (err) {
    console.error(
      `Error resetting savings data for user ${req.user._id}:`,
      err
    );
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
