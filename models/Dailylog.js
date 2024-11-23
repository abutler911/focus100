const mongoose = require("mongoose");

const DailylogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    required: true,
  },
  cardio: { type: Number, required: true },
  pushups: { type: Number, required: true },
  situps: { type: Number, required: true },
  savings: { type: Number, required: true },
  noAlcohol: { type: Boolean, required: true },
});

module.exports = mongoose.model("Dailylog", DailylogSchema);
