const indexRoutes = require("../routes/index");
const apiRoutes = require("../routes/api");
const dailylogRoutes = require("../routes/dailylog");
const profileRoutes = require("../routes/profile");
const forumRoutes = require("../routes/forum");
const savingsRoutes = require("../routes/savings");
const adminRoutes = require("../routes/admin");
const userRoutes = require("../routes/users");
const notificationsRoutes = require("../routes/notifications");

module.exports = (app) => {
  app.use("/", indexRoutes);
  app.use("/api", apiRoutes);
  app.use("/dailylog", dailylogRoutes);
  app.use("/profile", profileRoutes);
  app.use("/forum", forumRoutes);
  app.use("/savings", savingsRoutes);
  app.use("/admin", adminRoutes);
  app.use("/users", userRoutes);
  app.use("/notifications", notificationsRoutes);
};
