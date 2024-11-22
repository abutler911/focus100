const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).redirect("/");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(400).redirect("/");
  }
};

module.exports = authenticateToken;
