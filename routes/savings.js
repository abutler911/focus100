const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, (req, res) => {
  res.render("savings", { title: "100-Day Savings Tracker", user: req.user });
});

module.exports = router;
