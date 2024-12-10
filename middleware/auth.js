const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.warn(`No token provided for ${req.ip} on ${req.originalUrl}`);
    return res.format({
      json: () => res.status(401).json({ error: "No token provided" }),
      html: () => res.status(401).redirect("/login"),
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.user) {
      req.user = verified;
    }
    next();
  } catch (err) {
    console.error(
      `Token verification failed for ${req.ip} on ${req.originalUrl}: ${err.message}`
    );

    if (err.name === "TokenExpiredError") {
      return res.format({
        json: () => res.status(403).json({ error: "Token expired" }),
        html: () => res.status(403).redirect("/login"),
      });
    }

    return res.format({
      json: () => res.status(403).json({ error: "Invalid token" }),
      html: () => res.status(403).redirect("/unauthorized"),
    });
  }
};

module.exports = authenticateToken;
