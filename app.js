const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const errorHandler = require("./middleware/errorHandler");
const methodOverride = require("method-override");
const Notification = require("./models/Notification");

// Load environment variables
dotenv.config();

// Import routes
const indexRoutes = require("./routes/index");
const apiRoutes = require("./routes/api");
const dailylogRoutes = require("./routes/dailylog");
const profileRoutes = require("./routes/profile");
const forumRoutes = require("./routes/forum");
const savingsRoutes = require("./routes/savings");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");
const notificationsRoutes = require("./routes/notifications");

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(methodOverride("_method"));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use express-ejs-layouts
app.use(expressLayouts);

// Set the default layout
app.set("layout", "layout");

// Middleware to add global variables to views
app.use((req, res, next) => {
  res.locals.title = "Focus100";
  res.locals.user = req.user || null;
  next();
});

// Middleware to fetch notifications for authenticated users
app.use(async (req, res, next) => {
  if (req.user) {
    try {
      const notifications = await Notification.find({
        userId: req.user._id,
        read: false,
      }).limit(10); // Limit to 10 recent notifications for performance
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
});

// Middleware to determine the active page
app.use((req, res, next) => {
  const path = req.path.split("/")[1] || "dashboard";
  res.locals.activePage = path; // Set activePage based on the route
  console.log(`Active Page: ${res.locals.activePage}`);
  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/dailylog", dailylogRoutes);
app.use("/profile", profileRoutes);
app.use("/forum", forumRoutes);
app.use("/savings", savingsRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationsRoutes);

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// General Error Handler
app.use(errorHandler);

// Connect to Database
const connectDB = require("./config/db");
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Focus100 is running on port ${PORT}`);
});
