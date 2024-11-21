const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.get("/", (req, res) => {
  res.render("login", { title: "Focus100 Login" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Focus100 Register" });
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.user });
});

module.exports = router;
