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
      title: "Message Board",
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

// View a Specific Post
router.get("/posts/:id", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username")
      .populate("comments.author", "username");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const isAuthor = req.user && post.author._id.toString() === req.user._id;

    res.render("forum/post", {
      post,
      isAuthor,
      user: req.user || null,
      title: post.title,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading the post. Please try again later.");
  }
});

// Add a Comment to a Post
router.post("/posts/:id/comment", authenticateToken, async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    post.comments.push({
      content,
      author: req.user._id,
    });

    await post.save();
    res.redirect(`/forum/posts/${post._id}`);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).send("Error adding the comment. Please try again later.");
  }
});

// Render Edit Post Form
router.get("/posts/:id/edit", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.author.toString() !== req.user._id) {
      return res.status(403).send("Unauthorized");
    }

    res.render("forum/edit", { post, title: "Edit Post" });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading the post. Please try again later.");
  }
});

// Handle Edit Post Submission
router.post("/posts/:id/edit", authenticateToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.author.toString() !== req.user._id) {
      return res.status(403).send("Unauthorized");
    }

    post.title = title;
    post.content = content;

    await post.save();
    res.redirect(`/forum/posts/${post._id}`);
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).send("Error editing the post. Please try again later.");
  }
});

// Delete a Post
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

module.exports = router;
