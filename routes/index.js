const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");
const User = require("../models/User");
const Savings = require("../models/Savings");

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
    const user = await User.findById(userId); // Fetch the user to access their goals
    const logs = await Dailylog.find({ userId });
    const savingsEntries = await Savings.find({ userId }); // Fetch savings entries

    // Calculate the current date and days since/remaining until January 1, 2025
    const startDate = new Date("2025-01-01");
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24)
    );

    // Determine whether it's days until or days since
    const isPast = daysDifference >= 0;
    const days = Math.abs(daysDifference); // Always use absolute value

    // If no logs or savings entries, show default totals and message
    if (logs.length === 0 && savingsEntries.length === 0) {
      return res.render("dashboard", {
        title: "Dashboard - Focus100",
        user,
        totals: { cardio: 0, pushups: 0, situps: 0, savings: 0, noAlcohol: 0 },
        progress: {
          cardio: 0,
          pushups: 0,
          situps: 0,
          savings: 0,
          noAlcohol: 0,
        },
        goals: user.goals || {},
        message: "You haven't added any logs yet. Start tracking today!",
        currentDate: currentDate.toDateString(),
        days,
        isPast,
      });
    }

    // Calculate totals from logs
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

    // Add totals from savings entries
    const savingsTotal = savingsEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    totals.savings += savingsTotal;

    // Calculate 100-day total goals
    const totalGoals = {
      cardio: (user.goals.cardio || 0) * 100,
      pushups: (user.goals.pushups || 0) * 100,
      situps: (user.goals.situps || 0) * 100,
      savings: user.goals.savings || 0, // Already a total goal
      noAlcohol: 100, // 100 days no alcohol goal
    };

    // Calculate progress toward 100-day goals
    const progress = {
      cardio:
        totalGoals.cardio > 0
          ? Math.min((totals.cardio / totalGoals.cardio) * 100, 100)
          : 0,
      pushups:
        totalGoals.pushups > 0
          ? Math.min((totals.pushups / totalGoals.pushups) * 100, 100)
          : 0,
      situps:
        totalGoals.situps > 0
          ? Math.min((totals.situps / totalGoals.situps) * 100, 100)
          : 0,
      savings:
        totalGoals.savings > 0
          ? Math.min((totals.savings / totalGoals.savings) * 100, 100)
          : 0,
      noAlcohol:
        totalGoals.noAlcohol > 0
          ? (totals.noAlcohol / totalGoals.noAlcohol) * 100
          : 0,
    };

    res.render("dashboard", {
      title: "Dashboard - Focus100",
      user,
      totals,
      progress,
      totalGoals, // Pass 100-day goals to the template
      currentDate: currentDate.toDateString(),
      days,
      isPast,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
