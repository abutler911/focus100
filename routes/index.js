const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.get("/", (req, res) => {
  res.render("splash", { title: "Welcome to Focus100", layout: false });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login - Focus100" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register - Focus100" });
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("dashboard", { title: "Dashboard - Focus100", user: req.user });
});

module.exports = router;
