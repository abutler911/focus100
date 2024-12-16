const Dailylog = require("../models/Dailylog");

const renderSummary = async (req, res, next) => {
  try {
    // Fetch all daily logs for the user
    const logs = await Dailylog.find({ userId: req.user._id });

    // Prepare a 100-day data structure
    const days = Array(100)
      .fill(null)
      .map((_, index) => {
        const log = logs.find((l) => {
          const logDate = new Date(l.date);
          const startDate = new Date("2025-01-01");
          const dayIndex = Math.floor(
            (logDate - startDate) / (1000 * 60 * 60 * 24)
          );
          return dayIndex === index;
        });

        return {
          cardio: !!log?.cardio,
          pushups: !!log?.pushups,
          situps: !!log?.situps,
          savings: !!log?.savings,
        };
      });

    // Render the summary page
    res.render("summary", { user: req.user, days });
  } catch (err) {
    console.error("Error rendering summary:", err);
    next(err); // Pass the error to the error handler
  }
};

module.exports = {
  renderSummary,
};
