const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");

router.get("/", (req, res) => {
  res.render("splash", { title: "Welcome to Focus100", layout: false });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login - Focus100" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register - Focus100" });
});

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await Dailylog.find({ userId });

    if (logs.length === 0) {
      return res.render("dashboard", {
        title: "Dashboard - Focus100",
        user: req.user,
        totals: { cardio: 0, pushups: 0, situps: 0, savings: 0, noAlcohol: 0 },
        message: "You haven't added any logs yet. Start tracking today!",
      });
    }

    // Calculate totals
    const totals = logs.reduce(
      (acc, log) => {
        acc.cardio += log.cardio;
        acc.pushups += log.pushups;
        acc.situps += log.situps;
        acc.savings += log.savings;
        acc.noAlcohol += log.noAlcohol ? 1 : 0;
        return acc;
      },
      { cardio: 0, pushups: 0, situps: 0, savings: 0, noAlcohol: 0 }
    );

    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      totals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
