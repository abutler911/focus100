// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isAdmin = require("../middleware/isAdmin");
const authenticateToken = require("../middleware/auth");

// Admin dashboard
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    const allUsers = await User.find();
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      pendingUsers,
      allUsers,
      user: req.user,
      activePage: "admin",
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).send("Server error");
  }
});

// Approve a user
router.post("/approve/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.approved = true;
    await user.save();
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Grant admin privileges
router.post(
  "/grant-admin/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("User not found");
      }
      user.isAdmin = true;
      await user.save();
      res.redirect("/admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
