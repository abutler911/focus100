const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authenticateToken = require("../middleware/auth");

// GET: Fetch Notifications
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      isRead: false,
    }).sort({ createdAt: -1 });

    res.render("notifications", {
      notifications,
      title: "Notifications - Focus100",
      activePage: "notifications",
    });
  } catch (err) {
    console.error(
      `Error fetching notifications for user ${req.user._id}:`,
      err
    );
    res
      .status(500)
      .send("Error loading notifications. Please try again later.");
  }
});

// POST: Mark Notifications as Read
router.post("/notifications/read", authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    console.log(
      `Marked ${result.modifiedCount} notifications as read for user ${req.user._id}.`
    );
    res.status(200).json({ message: "Notifications marked as read." });
  } catch (err) {
    console.error(
      `Error marking notifications as read for user ${req.user._id}:`,
      err
    );
    res.status(500).json({ error: "Error updating notifications." });
  }
});

module.exports = router;
