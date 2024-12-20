const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Dailylog = require("../models/Dailylog");
const User = require("../models/User");
const Savings = require("../models/Savings");
const Notification = require("../models/Notification");

// Splash Page
router.get("/", (req, res) => {
  res.render("splash", {
    title: "Welcome to Focus100",
    layout: false,
    activePage: "home",
  });
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login - Focus100", activePage: "login" });
});

// Registration Page
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register - Focus100",
    activePage: "register",
  });
});

// Dashboard
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user and associated data in parallel for better performance
    const [user, logs, savingsEntries, notifications] = await Promise.all([
      User.findById(userId),
      Dailylog.find({ userId }),
      Savings.find({ userId }),
      Notification.find({ userId, read: false }),
    ]);

    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return res.status(404).send("User not found");
    }

    // Calculate date difference
    const startDate = new Date("2025-01-01");
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const isPast = daysDifference >= 0;
    const days = Math.abs(daysDifference);

    // Calculate user goals
    const userGoals = user.goals || {};
    const totalGoals = {
      cardio: (userGoals.cardio || 0) * 100,
      pushups: (userGoals.pushups || 0) * 100,
      situps: (userGoals.situps || 0) * 100,
      savings: userGoals.savings || 0,
      noAlcohol: userGoals.noAlcohol || 0,
    };

    // If no logs or savings entries exist
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

    // Calculate totals from logs and savings
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
    totals.savings += savingsEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    // Calculate progress percentages
    const progress = {
      cardio: totalGoals.cardio
        ? Math.min((totals.cardio / totalGoals.cardio) * 100, 100)
        : 0,
      pushups: totalGoals.pushups
        ? Math.min((totals.pushups / totalGoals.pushups) * 100, 100)
        : 0,
      situps: totalGoals.situps
        ? Math.min((totals.situps / totalGoals.situps) * 100, 100)
        : 0,
      savings: totalGoals.savings
        ? Math.min((totals.savings / totalGoals.savings) * 100, 100)
        : 0,
      noAlcohol: totalGoals.noAlcohol
        ? Math.min((totals.noAlcohol / totalGoals.noAlcohol) * 100, 100)
        : 0,
    };

    // Render dashboard with calculated data
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
    console.error("Error fetching dashboard data:", err.message);
    res.status(500).send("Server Error. Please try again later.");
  }
});

module.exports = router;
