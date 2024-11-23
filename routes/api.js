const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    username,
    password,
    confirmPassword,
    state,
    country,
  } = req.body;

  // Validation
  const errors = [];
  if (
    !firstname ||
    !lastname ||
    !email ||
    !username ||
    !password ||
    !state ||
    !country
  ) {
    errors.push("All fields are required.");
  }
  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push("Invalid email format.");
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      username,
      password: hashedPassword,
      state,
      country,
    });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    res
      .status(500)
      .json({ error: "Registration failed. Please try again later." });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, firstname: user.firstname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token as a cookie
    res.cookie("token", token, { httpOnly: true });

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ error: "Login failed. Please try again later." });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
