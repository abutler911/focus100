const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");

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

router.post("/new", authenticateToken, async (req, res) => {
  try {
    const { cardio, pushups, situps, savings, noAlcohol, date } = req.body;

    // Validate the date
    if (!date) {
      console.error("Date is missing from the request body.");
      return res.status(400).send("Date is required.");
    }

    // Parse and normalize the date
    const logDate = new Date(date + "T00:00:00");
    if (isNaN(logDate)) {
      console.error("Invalid date provided:", date);
      return res.status(400).send("Invalid date format.");
    }
    logDate.setHours(0, 0, 0, 0);

    console.log("Checking for log on date:", logDate);

    // Debugging: Fetch all logs for the user and print their dates
    const allLogs = await Dailylog.find({ userId: req.user._id });
    console.log(
      "All stored logs for user:",
      allLogs.map((log) => log.date)
    );

    // Use a strict date comparison
    const existingLog = await Dailylog.findOne({
      userId: req.user._id,
      date: logDate,
    });

    if (existingLog) {
      console.log("Existing log found. Aggregating values...");
      // Aggregate values into the existing log
      existingLog.cardio += parseInt(cardio, 10) || 0;
      existingLog.pushups += parseInt(pushups, 10) || 0;
      existingLog.situps += parseInt(situps, 10) || 0;
      existingLog.savings += parseFloat(savings) || 0;
      existingLog.noAlcohol = existingLog.noAlcohol && noAlcohol === "on";

      await existingLog.save();
      console.log("Log updated successfully.");
    } else {
      console.log("No existing log found. Creating a new one...");
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
      console.log("New log created successfully.");
    }

    // Redirect to the dashboard after successful log entry
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error adding daily log:", err.message);
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
      date: parsedDate,
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
