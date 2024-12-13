const express = require("express");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// Initialize app configuration
require("./config/init")();

// Load middleware
require("./config/middleware")(app);

// Load routes
require("./config/routes")(app);

// Use error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
require("./config/server")(app);
