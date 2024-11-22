const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");

// GET: Form to Add a New Log
router.get("/new", authenticateToken, (req, res) => {
  res.render("dailylog/new", { title: "Add Daily Log" });
});

// POST: Add a New Log
router.post("/new", authenticateToken, async (req, res) => {
  try {
    console.log("Request user:", req.user);
    console.log("Request body:", req.body);
    const { cardio, pushups, situps, savings, noAlcohol } = req.body;

    const log = new Dailylog({
      userId: req.user._id,
      cardio,
      pushups,
      situps,
      savings,
      noAlcohol: noAlcohol === "on",
    });

    await log.save();
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

module.exports = router;
