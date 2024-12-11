const express = require("express");
const { body, validationResult } = require("express-validator");
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
    res.render("profile", {
      title: "Your Profile",
      user,
      activePage: "profile",
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Server Error");
  }
});

// POST: Update User Information
router.post(
  "/update",
  authenticateToken,
  [
    body("firstname").notEmpty().withMessage("First name is required."),
    body("lastname").notEmpty().withMessage("Last name is required."),
    body("email").isEmail().withMessage("Invalid email address."),
    body("state").optional().isString(),
    body("country").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstname, lastname, email, state, country } = req.body;

      // Update user details
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstname, lastname, email, state, country },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.redirect("/profile");
    } catch (err) {
      console.error("Error updating user information:", err);
      res.status(500).send("Server Error");
    }
  }
);

// POST: Update Goals in Profile
router.post(
  "/goals",
  authenticateToken,
  [
    body("cardioGoal")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cardio goal must be a non-negative integer."),
    body("pushupsGoal")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Pushups goal must be a non-negative integer."),
    body("situpsGoal")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Situps goal must be a non-negative integer."),
    body("savingsGoal")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Savings goal must be a non-negative number."),
    body("noAlcoholGoal")
      .optional()
      .custom((value, { req }) => {
        // Treat the checkbox as true if it is "on", or false otherwise
        req.body.noAlcoholGoal = value === "on";
        return true; // Always return true for custom validators
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        cardioGoal,
        pushupsGoal,
        situpsGoal,
        savingsGoal,
        noAlcoholGoal,
      } = req.body;

      // Update user goals
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          goals: {
            cardio: parseInt(cardioGoal, 10) || 0,
            pushups: parseInt(pushupsGoal, 10) || 0,
            situps: parseInt(situpsGoal, 10) || 0,
            savings: parseFloat(savingsGoal) || 0,
            noAlcohol: noAlcoholGoal, // Already transformed into boolean above
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found");
      }

      res.redirect("/profile");
    } catch (err) {
      console.error("Error updating goals:", err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
