// middleware/globalMiddleware.js
const Notification = require("../models/Notification");

const addGlobalVariables = (req, res, next) => {
  res.locals.title = "Focus100";
  res.locals.user = req.user || null;
  next();
};

const fetchNotifications = async (req, res, next) => {
  if (req.user) {
    try {
      const notifications = await Notification.find({
        userId: req.user._id,
        read: false,
      }).limit(10);
      res.locals.notifications = notifications.map((notif) => ({
        postId: notif.postId,
        mentioner: notif.mentioner,
      }));
    } catch (err) {
      console.error(
        `Error fetching notifications for user ${req.user._id}:`,
        err
      );
      res.locals.notifications = [];
    }
  } else {
    res.locals.notifications = [];
  }
  next();
};

const determineActivePage = (req, res, next) => {
  const path = req.path.split("/")[1] || "dashboard";
  res.locals.activePage = path;
  console.log(`Active Page: ${res.locals.activePage}`);
  next();
};

module.exports = {
  addGlobalVariables,
  fetchNotifications,
  determineActivePage,
};
