const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Savings = require("../models/Savings");

// GET: Render Savings Page
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Fetch all savings entries for the user
    const savingsEntries = await Savings.find({ userId: req.user._id }).sort(
      "day"
    );

    // Calculate the total saved
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
    console.error("Error fetching savings data:", err);
    res.status(500).send("Server Error");
  }
});

// POST: Update Savings Entry
router.post("/update", authenticateToken, async (req, res) => {
  const { day, amount, action } = req.body;

  try {
    // Validate day and amount
    if (!day || day < 1 || day > 100 || !amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    if (action === "add") {
      // Add savings entry if it doesn't already exist
      const existingEntry = await Savings.findOne({
        userId: req.user._id,
        day,
      });

      if (!existingEntry) {
        await Savings.create({ userId: req.user._id, day, amount });
      }
    } else if (action === "remove") {
      // Remove savings entry
      await Savings.deleteOne({ userId: req.user._id, day });
    }

    // Recalculate the total saved
    const savingsEntries = await Savings.find({ userId: req.user._id });
    const totalSaved = savingsEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    res.status(200).json({ success: true, totalSaved });
  } catch (err) {
    console.error("Error updating savings entry:", err);
    res.status(500).send("Server Error");
  }
});

// POST: Reset Savings Data
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    // Delete all savings entries for the user
    await Savings.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error resetting savings data:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
