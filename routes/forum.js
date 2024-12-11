const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Post = require("../models/Posts");
const User = require("../models/User");
const Notification = require("../models/Notification");
const authenticateToken = require("../middleware/auth");

// GET: Forum Main Page (protected)
router.get("/main", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.render("forum/main", {
      posts,
      title: "Message Board",
      activePage: "forum",
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error loading forum. Please try again later.");
  }
});

// Upvote a post
// Upvote a post
router.post("/posts/:id/upvote", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Post ID" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.upvotes = (post.upvotes || 0) + 1;
    await post.save();

    res.status(200).json({ upvotes: post.upvotes, downvotes: post.downvotes });
    console.log(`Upvote: Post ID - ${req.params.id}`);
    console.log(`Updated Upvotes: ${post.upvotes}`);
  } catch (err) {
    console.error("Error handling upvote:", err);
    res.status(500).json({ error: "Failed to upvote" });
  }
});

// Downvote a post
router.post("/posts/:id/downvote", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid Post ID" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.downvotes = (post.downvotes || 0) + 1;
    await post.save();

    res.status(200).json({ upvotes: post.upvotes, downvotes: post.downvotes });
    console.log(`Upvote: Post ID - ${req.params.id}`);
    console.log(`Updated Upvotes: ${post.upvotes}`);
  } catch (err) {
    console.error("Error handling downvote:", err);
    res.status(500).json({ error: "Failed to downvote" });
  }
});

// GET: Render the Create Post Form (protected)
router.get("/new", authenticateToken, (req, res) => {
  res.render("forum/new", {
    title: "Create a New Post",
    activePage: "forum",
    user: req.user,
  });
});

// POST: Handle New Post Submission (protected)
router.post(
  "/new",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("content").notEmpty().withMessage("Content is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content } = req.body;

      const mentions =
        content.match(/@\w+/g)?.map((mention) => mention.slice(1)) || [];

      const mentionedUsers = await User.find({ username: { $in: mentions } });

      const newPost = await Post.create({
        title,
        content,
        author: req.user._id,
        mentions: mentionedUsers.map((user) => user._id),
      });

      for (const mentionedUser of mentionedUsers) {
        await Notification.create({
          userId: mentionedUser._id,
          postId: newPost._id,
          mentioner: req.user.firstname,
          message: `@${req.user.firstname} mentioned you in a post.`,
        });
      }

      res.redirect("/forum/main");
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).send("Error creating the post. Please try again later.");
    }
  }
);

// GET: View a Specific Post (protected)
router.get("/posts/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error("Invalid post ID:", id);
    return res.status(400).send("Invalid Post ID");
  }

  try {
    const post = await Post.findById(id)
      .populate("author", "username")
      .populate("comments.author", "username");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const isAuthor = req.user && post.author._id.toString() === req.user._id;

    res.render("forum/post", {
      post,
      isAuthor,
      user: req.user,
      title: post.title,
      activePage: "forum",
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading the post. Please try again later.");
  }
});

// POST: Add a Comment to a Post (protected)
router.post(
  "/posts/:id/comment",
  authenticateToken,
  [body("content").notEmpty().withMessage("Comment content cannot be empty.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).send("Post not found");
      }

      post.comments.push({
        content: req.body.content,
        author: req.user._id,
      });

      await post.save();
      res.redirect(`/forum/posts/${post._id}`);
    } catch (err) {
      console.error("Error adding comment:", err);
      res.status(500).send("Error adding the comment. Please try again later.");
    }
  }
);

// GET: Render Edit Post Form (protected)
router.get("/posts/:id/edit", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.author.toString() !== req.user._id) {
      return res.status(403).send("Unauthorized");
    }

    res.render("forum/edit", { post, title: "Edit Post", user: req.user });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading the post. Please try again later.");
  }
});

// POST: Handle Edit Post Submission (protected)
router.post(
  "/posts/:id/edit",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("content").notEmpty().withMessage("Content is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const post = await Post.findById(req.params.id);

      if (!post || post.author.toString() !== req.user._id) {
        return res.status(403).send("Unauthorized");
      }

      post.title = req.body.title;
      post.content = req.body.content;

      await post.save();
      res.redirect(`/forum/posts/${post._id}`);
    } catch (err) {
      console.error("Error editing post:", err);
      res.status(500).send("Error editing the post. Please try again later.");
    }
  }
);

// POST: Delete a Post (protected)
router.post("/posts/:id/delete", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.author.toString() !== req.user._id) {
      return res.status(403).send("Unauthorized");
    }

    await post.deleteOne();
    res.redirect("/forum/main");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting the post. Please try again later.");
  }
});

// GET: User Search for Mentions (protected)
router.get("/search", authenticateToken, async (req, res) => {
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
