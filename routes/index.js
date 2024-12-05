const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");
const User = require("../models/User");
const Savings = require("../models/Savings");
const Notification = require("../models/Notification");

router.get("/", (req, res) => {
  res.render("splash", {
    title: "Welcome to Focus100",
    layout: false,
    activePage: "home",
  });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login - Focus100", activePage: "login" });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register - Focus100",
    activePage: "register",
  });
});

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const logs = await Dailylog.find({ userId });
    const savingsEntries = await Savings.find({ userId });
    const notifications = await Notification.find({ userId, read: false });

    const startDate = new Date("2025-01-01");
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const isPast = daysDifference >= 0;
    const days = Math.abs(daysDifference);

    const userGoals = user.goals || {};
    const totalGoals = {
      cardio: (userGoals.cardio || 0) * 100,
      pushups: (userGoals.pushups || 0) * 100,
      situps: (userGoals.situps || 0) * 100,
      savings: userGoals.savings || 0,
    };

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
        totalGoals,
        message: "You haven't added any logs yet. Start tracking today!",
        currentDate: currentDate.toDateString(),
        days,
        isPast,
        activePage: "dashboard",
        notifications,
      });
    }

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

    const savingsTotal = savingsEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );
    totals.savings += savingsTotal;

    const progress = {
      cardio: Math.min((totals.cardio / totalGoals.cardio) * 100, 100),
      pushups: Math.min((totals.pushups / totalGoals.pushups) * 100, 100),
      situps: Math.min((totals.situps / totalGoals.situps) * 100, 100),
      savings: Math.min((totals.savings / totalGoals.savings) * 100, 100),
      noAlcohol: totalGoals.noAlcohol
        ? (totals.noAlcohol / totalGoals.noAlcohol) * 100
        : null,
    };

    res.render("dashboard", {
      title: "Dashboard - Focus100",
      user,
      totals,
      progress,
      totalGoals,
      currentDate: currentDate.toDateString(),
      days,
      isPast,
      activePage: "dashboard",
      notifications,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
