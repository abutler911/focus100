const dotenv = require("dotenv");
const connectDB = require("./db");

module.exports = () => {
  // Load environment variables
  dotenv.config();

  // Connect to database
  connectDB();
};
