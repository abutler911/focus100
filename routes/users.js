const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Search Users Route
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query cannot be empty." });
    }

    const users = await User.find({
      username: { $regex: `^${query.trim()}`, $options: "i" },
    })
      .limit(10)
      .select("username");

    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
