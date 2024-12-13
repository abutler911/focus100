const createError = (message, status = 500) => ({
  message: message || "Internal Server Error",
  status: status || 500,
});

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status);

  // Send a response based on the Accept header
  if (req.accepts("html")) {
    return res.render("error", {
      title: "Error",
      message: err.message || "Internal Server Error",
      status,
    });
  }

  if (req.accepts("json")) {
    return res.json({
      error: { message: err.message || "Internal Server Error", status },
    });
  }

  // Default to plain text
  res.type("txt").send(err.message || "Internal Server Error");
};

const notFoundHandler = (req, res, next) => {
  next(createError("Page Not Found", 404));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
