const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Posts");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");
const Notification = require("../models/Notification");

router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      isRead: false,
    }).sort({
      createdAt: -1,
    });

    res.render("notifications", { notifications, title: "Notifications" });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res
      .status(500)
      .send("Error loading notifications. Please try again later.");
  }
});

router.post("/notifications/read", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).send("Notifications marked as read.");
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).send("Error updating notifications.");
  }
});

module.exports = router;
