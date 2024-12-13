const Dailylog = require("../models/Dailylog");
const { validationResult } = require("express-validator");

// Utility function: Parse and normalize date
const parseAndNormalizeDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date)) throw new Error("Invalid date format");
  date.setHours(0, 0, 0, 0);
  return date;
};

// Render form to create a new log
const renderNewLogForm = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const existingLog = await Dailylog.findOne({
      userId: req.user._id,
      date: today,
    });

    res.render("dailylog/new", {
      title: "New Log - Focus100",
      date: today,
      activePage: "dailylog",
    });
  } catch (err) {
    next(err);
  }
};

// Create or update a daily log
const createOrUpdateLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const logDate = parseAndNormalizeDate(req.body.date);
    const { cardio, pushups, situps, savings, noAlcohol } = req.body;

    let log = await Dailylog.findOne({ userId: req.user._id, date: logDate });

    if (log) {
      log.cardio += parseInt(cardio, 10) || 0;
      log.pushups += parseInt(pushups, 10) || 0;
      log.situps += parseInt(situps, 10) || 0;
      log.savings += parseFloat(savings) || 0;
      log.noAlcohol = log.noAlcohol && noAlcohol === "on";
      await log.save();
    } else {
      log = new Dailylog({
        userId: req.user._id,
        date: logDate,
        cardio: parseInt(cardio, 10) || 0,
        pushups: parseInt(pushups, 10) || 0,
        situps: parseInt(situps, 10) || 0,
        savings: parseFloat(savings) || 0,
        noAlcohol: noAlcohol === "on",
      });
      await log.save();
    }

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

// Get all logs
const getAllLogs = async (req, res, next) => {
  try {
    const logs = await Dailylog.find({ userId: req.user._id }).sort({
      date: -1,
    });
    res.render("dailylog/index", { title: "Your Daily Logs", logs });
  } catch (err) {
    next(err);
  }
};

// Render edit form for a log
const renderEditLogForm = async (req, res, next) => {
  try {
    const log = await Dailylog.findById(req.params.id);
    if (!log || log.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this log." });
    }
    res.render("dailylog/edit", { title: "Edit Log", log });
  } catch (err) {
    next(err);
  }
};

// Update an existing log
const updateLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parsedDate = parseAndNormalizeDate(req.body.date);
    const { cardio, pushups, situps, savings, noAlcohol } = req.body;

    const updatedLog = {
      cardio: parseInt(cardio, 10) || 0,
      pushups: parseInt(pushups, 10) || 0,
      situps: parseInt(situps, 10) || 0,
      savings: parseFloat(savings) || 0,
      noAlcohol: noAlcohol === "on",
      date: parsedDate,
    };

    const log = await Dailylog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatedLog,
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.redirect("/dailylog");
  } catch (err) {
    next(err);
  }
};

// Delete a log
const deleteLog = async (req, res, next) => {
  try {
    const log = await Dailylog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.redirect("/dailylog");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  renderNewLogForm,
  createOrUpdateLog,
  getAllLogs,
  renderEditLogForm,
  updateLog,
  deleteLog,
};
