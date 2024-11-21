const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

//load env variables
dotenv.config();

// Import routes
const indexRoutes = require("./routes/index");
const apiRoutes = require("./routes/api");

//Init express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Set view engine
app.set("view engine", "ejs");

// Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);

// Connect to DB
const connectDB = require("./config/db");
connectDB();

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Focus100 is running on port ${PORT}`);
});
