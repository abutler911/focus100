const express = require("express");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();

// Initialize app configuration
require("./config/init")();

// Load middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: "auto" },
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

require("./config/middleware")(app);

// Load routes
require("./config/routes")(app);

// Use error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
require("./config/server")(app);
