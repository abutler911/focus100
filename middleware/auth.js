const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token found in cookies or headers");
    return res.status(401).redirect("/login");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.user) {
      req.user = verified;
    }
    next();
  } catch (err) {
    console.error(`Token verification failed for ${req.ip}: ${err.message}`);
    if (err.name === "TokenExpiredError") {
      return res.status(403).redirect("/login");
    }
    return res.status(403).redirect("/unauthorized");
  }
};

module.exports = authenticateToken;
