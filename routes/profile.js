const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const User = require("../models/User");

// GET: Display User Profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("profile", { title: "Your Profile", user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server Error");
  }
});

// POST: Update Goals in Profile
router.post("/goals", authenticateToken, async (req, res) => {
  try {
    const { cardioGoal, pushupsGoal, situpsGoal, savingsGoal, noAlcoholGoal } =
      req.body;

    // Update user goals
    await User.findByIdAndUpdate(req.user._id, {
      goals: {
        cardio: parseInt(cardioGoal, 10) || 0,
        pushups: parseInt(pushupsGoal, 10) || 0,
        situps: parseInt(situpsGoal, 10) || 0,
        savings: parseFloat(savingsGoal) || 0,
        noAlcohol: noAlcoholGoal === "on",
      },
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating goals:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
