import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { todayKey, toDateKey } from "../utils/dateUtils.js";
import {
  isScheduledOn,
  calcScheduledCurrentStreak,
  calcScheduledLongestStreak,
  scheduledStats,
} from "../utils/schedule.js";

// @desc   All dashboard numbers in one request (now recurrence-aware).
// @route  GET /api/dashboard
// @access Private
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = todayKey();

  const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
  const logs = await HabitLog.find({ userId, completed: true });

  // Group completed date keys by habit id.
  const logsByHabit = {};
  for (const log of logs) {
    (logsByHabit[log.habitId.toString()] ||= []).push(log.date);
  }

  let bestCurrent = 0;
  let bestLongest = 0;

  const habitStats = habits.map((habit) => {
    const completedSet = new Set(logsByHabit[habit._id.toString()] || []);
    const currentStreak = calcScheduledCurrentStreak(habit, completedSet);
    const longestStreak = calcScheduledLongestStreak(habit, completedSet);
    const { expected, completed } = scheduledStats(habit, completedSet);
    const score = Math.min(100, Math.round((completed / expected) * 100));

    bestCurrent = Math.max(bestCurrent, currentStreak);
    bestLongest = Math.max(bestLongest, longestStreak);

    return {
      _id: habit._id,
      title: habit.title,
      frequency: habit.frequency,
      daysOfWeek: habit.daysOfWeek,
      interval: habit.interval,
      currentStreak,
      longestStreak,
      completedDays: completed,
      expectedDays: expected,
      score,
      scheduledToday: isScheduledOn(habit, today), // drives the Today filter
      completedToday: completedSet.has(today),
    };
  });

  // "Today" stats only consider habits actually scheduled for today, so an
  // off-day habit never drags down the completion rate.
  const totalHabits = habits.length;
  const scheduledToday = habitStats.filter((h) => h.scheduledToday);
  const completedToday = scheduledToday.filter((h) => h.completedToday).length;
  const completionRate =
    scheduledToday.length === 0
      ? 0
      : Math.round((completedToday / scheduledToday.length) * 100);

  const overallScore =
    habitStats.length === 0
      ? 0
      : Math.round(habitStats.reduce((s, h) => s + h.score, 0) / habitStats.length);

  // Heatmap: completions per day over the last 120 days (extended in Phase 4).
  const counts = {};
  for (const log of logs) counts[log.date] = (counts[log.date] || 0) + 1;
  const heatmap = [];
  const start = new Date();
  start.setDate(start.getDate() - 119);
  for (let i = 0; i < 120; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = toDateKey(d);
    heatmap.push({ date: key, count: counts[key] || 0 });
  }

  res.json({
    stats: {
      totalHabits,
      scheduledTodayCount: scheduledToday.length,
      completedToday,
      completionRate,
      currentStreak: bestCurrent,
      longestStreak: bestLongest,
      overallScore,
    },
    habits: habitStats,
    heatmap,
  });
});
