const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");

// GET: Form to Add a New Log
router.get("/new", authenticateToken, (req, res) => {
  res.render("dailylog/new", { title: "Add Daily Log" });
});

router.post("/new", authenticateToken, async (req, res) => {
  try {
    const { cardio, pushups, situps, savings, noAlcohol, date } = req.body;

    // Parse the date input and normalize to midnight in the local time zone
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Check for existing log for the user on this date
    const existingLog = await Dailylog.findOne({
      userId: req.user._id,
      date: logDate,
    });

    if (existingLog) {
      // Aggregate values if a log already exists
      existingLog.cardio += parseInt(cardio, 10) || 0;
      existingLog.pushups += parseInt(pushups, 10) || 0;
      existingLog.situps += parseInt(situps, 10) || 0;
      existingLog.savings += parseFloat(savings) || 0;
      existingLog.noAlcohol = existingLog.noAlcohol && noAlcohol === "on";

      await existingLog.save();
    } else {
      // Create a new log
      const newLog = new Dailylog({
        userId: req.user._id,
        date: logDate,
        cardio: parseInt(cardio, 10) || 0,
        pushups: parseInt(pushups, 10) || 0,
        situps: parseInt(situps, 10) || 0,
        savings: parseFloat(savings) || 0,
        noAlcohol: noAlcohol === "on",
      });

      await newLog.save();
    }

    res.redirect("/dailylog");
  } catch (err) {
    console.error("Error adding daily log:", err);
    res.status(500).send("Server Error");
  }
});

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
      return res.status(403).send("Unauthorized");
    }
    res.render("dailylog/edit", { title: "Edit Log", log });
  } catch (err) {
    console.error("Error fetching log for edit:", err);
    res.status(500).send("Server Error");
  }
});

// PUT: Update an Existing Log
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { cardio, pushups, situps, savings, noAlcohol, date } = req.body;

    // Parse the date to ensure it's valid
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }

    const updatedLog = {
      cardio: parseInt(cardio, 10) || 0,
      pushups: parseInt(pushups, 10) || 0,
      situps: parseInt(situps, 10) || 0,
      savings: parseFloat(savings) || 0,
      noAlcohol: noAlcohol === "on",
      date: parsedDate, // Ensure a valid Date object is saved
    };

    const log = await Dailylog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatedLog,
      { new: true }
    );

    if (!log) {
      return res.status(404).send("Log not found");
    }

    res.redirect("/dailylog");
  } catch (err) {
    console.error("Error updating log:", err);
    res.status(500).send("Server Error");
  }
});

// DELETE: Delete a Log
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const log = await Dailylog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).send("Log not found");
    }

    res.redirect("/dailylog");
  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
