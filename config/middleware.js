const express = require("express");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const globalMiddleware = require("../middleware/globalMiddleware");

module.exports = (app) => {
  // Built-in Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(cookieParser());
  app.use(methodOverride("_method"));

  // View Engine
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));
  app.use(expressLayouts);
  app.set("layout", "layout");

  // Global Middleware
  app.use(globalMiddleware.addGlobalVariables);
  app.use(globalMiddleware.fetchNotifications);
  app.use(globalMiddleware.determineActivePage);
};
