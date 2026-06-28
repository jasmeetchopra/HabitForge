import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import Todo from "../models/Todo.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { todayKey, toDateKey, shiftDateKey } from "../utils/dateUtils.js";
import {
  isScheduledOn,
  calcScheduledCurrentStreak,
  calcScheduledLongestStreak,
  scheduledStats,
} from "../utils/schedule.js";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// @desc   Rich analytics for the dashboard: streaks, completion trends,
//         per-habit scores, most-completed/missed, todo stats, 365-day heatmap.
// @route  GET /api/analytics
// @access Private
export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = todayKey();

  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({ userId, completed: true });
  const todos = await Todo.find({ userId });

  // completed date-sets per habit + total counts per day
  const byHabit = {};
  const countByDay = {};
  for (const l of logs) {
    (byHabit[l.habitId.toString()] ||= new Set()).add(l.date);
    countByDay[l.date] = (countByDay[l.date] || 0) + 1;
  }
  const setFor = (h) => byHabit[h._id.toString()] || new Set();

  // per-habit stats (recurrence-aware)
  const habitStats = habits.map((h) => {
    const set = setFor(h);
    const { expected, completed } = scheduledStats(h, set);
    return {
      _id: h._id,
      title: h.title,
      score: Math.min(100, Math.round((completed / expected) * 100)),
      completedDays: set.size,
      currentStreak: calcScheduledCurrentStreak(h, set),
      longestStreak: calcScheduledLongestStreak(h, set),
    };
  });

  const bestCurrent = habitStats.reduce((m, h) => Math.max(m, h.currentStreak), 0);
  const bestLongest = habitStats.reduce((m, h) => Math.max(m, h.longestStreak), 0);
  const overallScore = habitStats.length
    ? Math.round(habitStats.reduce((s, h) => s + h.score, 0) / habitStats.length)
    : 0;

  // weekly: last 7 days, scheduled vs completed across all habits
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const key = shiftDateKey(today, -i);
    let scheduled = 0, completed = 0;
    for (const h of habits) {
      if (isScheduledOn(h, key)) {
        scheduled += 1;
        if (setFor(h).has(key)) completed += 1;
      }
    }
    weekly.push({
      date: key,
      label: WD[new Date(key + "T00:00:00").getDay()],
      scheduled,
      completed,
      rate: scheduled ? Math.round((completed / scheduled) * 100) : 0,
    });
  }

  // monthly trend: completions per day for the last 30 days (line chart)
  const monthly = [];
  for (let i = 29; i >= 0; i--) {
    const key = shiftDateKey(today, -i);
    monthly.push({ date: key, label: key.slice(5), completed: countByDay[key] || 0 });
  }

  // most completed + currently missed (scheduled today, not yet done)
  const mostCompleted =
    [...habitStats].sort((a, b) => b.completedDays - a.completedDays)[0] || null;
  const missed = habits
    .filter((h) => isScheduledOn(h, today) && !setFor(h).has(today))
    .map((h) => ({ _id: h._id, title: h.title }));

  const todoStats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
    overdue: todos.filter(
      (t) => !t.completed && t.dueDate && toDateKey(new Date(t.dueDate)) < today
    ).length,
  };

  // 365-day heatmap
  const heatmap = [];
  for (let i = 364; i >= 0; i--) {
    const key = shiftDateKey(today, -i);
    heatmap.push({ date: key, count: countByDay[key] || 0 });
  }

  res.json({
    summary: {
      currentStreak: bestCurrent,
      longestStreak: bestLongest,
      overallScore,
      totalHabits: habits.length,
      completionToday: weekly[weekly.length - 1]?.rate ?? 0,
      mostCompleted,
      missedCount: missed.length,
    },
    weekly,
    monthly,
    byHabit: habitStats.map((h) => ({ title: h.title, score: h.score, completedDays: h.completedDays })),
    missed,
    todoStats,
    heatmap,
  });
});

// @desc   Breakdown for a single day (used when a heatmap cell is clicked).
// @route  GET /api/analytics/day/:date
// @access Private
export const getDayDetail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = req.params.date; // YYYY-MM-DD

  const habits = await Habit.find({ userId });
  const dayLogs = await HabitLog.find({ userId, date, completed: true });
  const doneIds = new Set(dayLogs.map((l) => l.habitId.toString()));

  const completedHabits = [];
  const missedHabits = [];
  for (const h of habits) {
    const wasDone = doneIds.has(h._id.toString());
    if (isScheduledOn(h, date)) {
      (wasDone ? completedHabits : missedHabits).push(h.title);
    } else if (wasDone) {
      completedHabits.push(h.title); // done on an off-day still counts
    }
  }

  // Todos marked complete on that day (approx via updatedAt — we don't store a
  // separate completion timestamp).
  const todos = await Todo.find({ userId, completed: true });
  const completedTodos = todos
    .filter((t) => toDateKey(new Date(t.updatedAt)) === date)
    .map((t) => t.title);

  res.json({ date, completedHabits, missedHabits, completedTodos });
});
