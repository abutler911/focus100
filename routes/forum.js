const express = require("express");
const router = express.Router();
const Post = require("../models/Posts");
const authenticateToken = require("../middleware/auth");

router.get("/main", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.render("forum/main", {
      posts,
      title: "Community Forum",
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error loading forum. Please try again later.");
  }
});

// Render the Create Post Form
router.get("/new", authenticateToken, (req, res) => {
  res.render("forum/new", { title: "Create a New Post" });
});

// Handle New Post Submission
router.post("/new", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await Post.create({
      title,
      content,
      author: req.user._id,
    });
    res.redirect("/forum/main");
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Error creating the post. Please try again later.");
  }
});

module.exports = router;
