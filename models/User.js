const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  goals: {
    cardio: { type: Number, default: 0 },
    pushups: { type: Number, default: 0 },
    situps: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    noAlcohol: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("User", UserSchema);
