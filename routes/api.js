const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Dailylog = require("../models/Dailylog");
const axios = require("axios");
const router = express.Router();
const sgMail = require("@sendgrid/mail");

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests. Please try again later.",
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/quote", async (req, res) => {
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    res.json(response.data[0]);
  } catch (error) {
    console.error("Error fetching quote:", error.message);
    res.status(500).send({ error: "Failed to fetch quote" });
  }
});

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email format."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, username, password, state, country } =
      req.body;

    try {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Email or username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstname,
        lastname,
        email,
        username,
        password: hashedPassword,
        state,
        country,
        approved: false,
      });

      await newUser.save();

      // Send registration email
      const subject = "Welcome to Focus100!";
      const text = `Hi ${firstname},\n\nThank you for registering for Focus100! Get ready to achieve your goals.\n\nBest regards,\nThe Focus100 Team`;
      const html = `<p>Hi <strong>${firstname}</strong>,</p><p>Thank you for registering for Focus100! Get ready to achieve your goals.</p><p>Best regards,<br>The Focus100 Team</p>`;

      const msg = {
        to: email,
        from: "support@focus-100.com", // Replace with your verified sender email
        subject,
        text,
        html,
      };

      try {
        await sgMail.send(msg);
        console.log(`Welcome email sent to ${email}`);
      } catch (error) {
        console.error(
          "Error sending welcome email:",
          error.response?.body || error.message
        );
      }

      res.redirect("/login");
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  }
);

router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    if (!user.approved) {
      return res.render("pendingApproval", {
        title: "Pending Approval",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { _id: user._id, firstname: user.firstname, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await Dailylog.findOne({
      userId: user._id,
      date: today,
    });

    if (existingLog) {
      return res.redirect("/dashboard");
    } else {
      return res.redirect("/dailylog/new");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again later." });
  }
});

// Logout User
router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed. Please try again later." });
  }
});

router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword", {
    title: "Forgot Password",
  });
});

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).send("No account with that email exists.");

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    res.send("Password reset email has been sent.");
  })
);

router.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;

  res.render("resetPassword", {
    title: "Reset Password",
    token,
  });
});

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).send("Invalid or expired token.");

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.send("Password reset successful. You may now log in.");
  })
);

const sendPasswordResetEmail = async (email, resetLink) => {
  const msg = {
    to: email,
    from: "support@focus-100.com",
    subject: "Password Reset Request",
    text: `You requested a password reset. Use the following link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset. Use the following link to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
    replyTo: "support@focus100.com",
  };

  try {
    await sgMail.send(msg);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error.response.body);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = router;
