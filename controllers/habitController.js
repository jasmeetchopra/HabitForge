import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateHabit } from "../middleware/validators.js";
import { todayKey } from "../utils/dateUtils.js";

// Helper: find a habit and make sure it belongs to the logged-in user.
// This is our authorization check - users must never touch another user's data.
const findOwnedHabit = async (habitId, userId, res) => {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    res.status(404);
    throw new Error("Habit not found");
  }
  if (habit.userId.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("You do not have access to this habit");
  }
  return habit;
};

// @desc   Get all habits for the logged-in user
// @route  GET /api/habits
// @access Private
export const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(habits);
});

// @desc   Get a single habit (with its completion log dates)
// @route  GET /api/habits/:id
// @access Private
export const getHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id, res);
  const logs = await HabitLog.find({ habitId: habit._id }).sort({ date: 1 });
  res.json({ habit, logs });
});

// @desc   Create a habit
// @route  POST /api/habits
// @access Private
export const createHabit = asyncHandler(async (req, res) => {
  validateHabit(req, res);
  const { title, description, frequency, daysOfWeek, interval } = req.body;

  const habit = await Habit.create({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    frequency: frequency || "daily",
    daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [],
    interval: interval || 1,
  });

  res.status(201).json(habit);
});

// @desc   Update a habit
// @route  PUT /api/habits/:id
// @access Private
export const updateHabit = asyncHandler(async (req, res) => {
  validateHabit(req, res);
  const habit = await findOwnedHabit(req.params.id, req.user._id, res);

  const { title, description, frequency, daysOfWeek, interval } = req.body;
  habit.title = title.trim();
  habit.description = description?.trim() ?? habit.description;
  if (frequency) habit.frequency = frequency;
  if (Array.isArray(daysOfWeek)) habit.daysOfWeek = daysOfWeek;
  if (interval !== undefined) habit.interval = interval;

  const updated = await habit.save();
  res.json(updated);
});

// @desc   Delete a habit (and all of its logs)
// @route  DELETE /api/habits/:id
// @access Private
export const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id, res);

  // Clean up the logs too, otherwise we'd leave orphaned data behind.
  await HabitLog.deleteMany({ habitId: habit._id });
  await habit.deleteOne();

  res.json({ message: "Habit deleted", id: habit._id });
});

// @desc   Mark a habit complete for a day (defaults to today)
// @route  POST /api/habits/:id/complete
// @access Private
export const completeHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id, res);
  const date = req.body.date || todayKey();

  // upsert: create the log if it doesn't exist, do nothing extra if it does.
  // The unique index on (habitId, date) guarantees one log per day.
  const log = await HabitLog.findOneAndUpdate(
    { habitId: habit._id, date },
    { $set: { completed: true, userId: req.user._id } },
    { new: true, upsert: true }
  );

  res.status(201).json(log);
});

// @desc   Unmark a habit for a day (defaults to today)
// @route  DELETE /api/habits/:id/complete
// @access Private
export const uncompleteHabit = asyncHandler(async (req, res) => {
  const habit = await findOwnedHabit(req.params.id, req.user._id, res);
  const date = req.body.date || req.query.date || todayKey();

  await HabitLog.findOneAndDelete({ habitId: habit._id, date });
  res.json({ message: "Completion removed", date });
});
