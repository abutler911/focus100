const User = require("../models/User");

// Admin dashboard: Fetch pending and all users
const getAdminDashboard = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ approved: false });
    const allUsers = await User.find();
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      pendingUsers,
      allUsers,
      user: req.user,
      activePage: "admin",
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    next(error);
  }
};

// Approve a user
const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.approved = true;
    await user.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error approving user:", error);
    next(error);
  }
};

// Grant admin privileges
const grantAdminPrivileges = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.isAdmin = true;
    await user.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error granting admin privileges:", error);
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  approveUser,
  grantAdminPrivileges,
};
