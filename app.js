const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const errorHandler = require("./middleware/errorHandler");
const methodOverride = require("method-override");

//load env variables
dotenv.config();

// Import routes
const indexRoutes = require("./routes/index");
const apiRoutes = require("./routes/api");
const dailylogRoutes = require("./routes/dailylog");
const profileRoutes = require("./routes/profile");
const forumRoutes = require("./routes/forum");
const savingsRoutes = require("./routes/savings");

//Init express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/dailylog", dailylogRoutes);
app.use("/profile", profileRoutes);
app.use("/forum", forumRoutes);
app.use("/savings", savingsRoutes);

app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});

app.get("/error", (req, res, next) => {
  const error = new Error("This is a TEST error");
  error.status = 400;
  next(error);
});

// Error handler
app.use(errorHandler);

// Connect to DB
const connectDB = require("./config/db");
connectDB();

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Focus100 is running on port ${PORT}`);
});
