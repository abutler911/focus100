module.exports = (req, res, next) => {
  // Log the user object to ensure it's populated
  console.log("Debugging isAdmin middleware:");
  console.log("req.user:", req.user);

  // Check if user exists and if they are an admin
  if (req.user && req.user.isAdmin) {
    console.log("User is an admin. Granting access.");
    return next();
  }

  // Log why the access is denied
  if (!req.user) {
    console.log("Access denied: req.user is undefined or null.");
  } else if (!req.user.isAdmin) {
    console.log("Access denied: User is not an admin.");
  }

  // Render the 403 page with a custom message
  res.status(403).render("403", {
    message: "You do not have permission to access this page.",
  });
};
