const express = require("express");
const { query, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/User");

// Search Users Route
router.get(
  "/search",
  [
    query("query")
      .notEmpty()
      .withMessage("Query cannot be empty.")
      .isString()
      .withMessage("Query must be a string."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { query: searchQuery } = req.query;

      const users = await User.find({
        username: { $regex: `^${searchQuery.trim()}`, $options: "i" },
      })
        .limit(10)
        .select("username");

      if (users.length === 0) {
        return res.status(404).json({ message: "No users found." });
      }

      res.status(200).json(users);
    } catch (err) {
      console.error("Error searching users:", err.message);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

module.exports = router;
