// Recurrence engine (Phase 2). All "day" logic uses YYYY-MM-DD keys so it
// matches HabitLog.date exactly and is time-zone safe.
import { toDateKey, todayKey, shiftDateKey } from "./dateUtils.js";

const weekday = (dateKey) => new Date(dateKey + "T00:00:00").getDay(); // 0..6

const daysBetween = (aKey, bKey) =>
  Math.round(
    (new Date(bKey + "T00:00:00") - new Date(aKey + "T00:00:00")) / 86400000
  );

const createdKey = (habit) => toDateKey(new Date(habit.createdAt));

// Is this habit "supposed" to be done on the given day?
// This single function is the source of truth for the Today filter, streaks,
// and consistency, so all of them agree on what counts as a scheduled day.
export const isScheduledOn = (habit, dateKey) => {
  if (dateKey < createdKey(habit)) return false; // before the habit existed

  switch (habit.frequency) {
    case "daily":
      return true;

    case "weekly": {
      // Weekly = specific weekday(s). If none chosen, fall back to the
      // weekday it was created on, so a "weekly" habit is never every-day.
      const days =
        habit.daysOfWeek && habit.daysOfWeek.length
          ? habit.daysOfWeek
          : [weekday(createdKey(habit))];
      return days.includes(weekday(dateKey));
    }

    case "custom": {
      // Custom prefers explicit weekdays; otherwise "every N days".
      if (habit.daysOfWeek && habit.daysOfWeek.length) {
        return habit.daysOfWeek.includes(weekday(dateKey));
      }
      const interval = Math.max(1, habit.interval || 1);
      return daysBetween(createdKey(habit), dateKey) % interval === 0;
    }

    default:
      return true;
  }
};

// Current streak counting ONLY scheduled days. A missed scheduled day breaks
// the streak; non-scheduled days are skipped (they can't break it). If today
// is scheduled but not yet done, we don't count it as a miss.
export const calcScheduledCurrentStreak = (habit, completedSet) => {
  const today = todayKey();
  const start = createdKey(habit);
  let cursor = today;

  if (isScheduledOn(habit, cursor) && !completedSet.has(cursor)) {
    cursor = shiftDateKey(cursor, -1); // today still pending -> look back
  }

  let streak = 0;
  while (cursor >= start) {
    if (isScheduledOn(habit, cursor)) {
      if (completedSet.has(cursor)) streak += 1;
      else break; // a missed SCHEDULED day ends the streak
    }
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
};

// Longest run of consecutive scheduled days that were all completed.
export const calcScheduledLongestStreak = (habit, completedSet) => {
  const today = todayKey();
  let cursor = createdKey(habit);
  let longest = 0;
  let run = 0;

  while (cursor <= today) {
    if (isScheduledOn(habit, cursor)) {
      if (completedSet.has(cursor)) {
        run += 1;
        if (run > longest) longest = run;
      } else {
        run = 0;
      }
    }
    cursor = shiftDateKey(cursor, 1);
  }
  return longest;
};

// Expected vs completed scheduled days -> drives the consistency score.
export const scheduledStats = (habit, completedSet) => {
  const today = todayKey();
  let cursor = createdKey(habit);
  let expected = 0;
  let completed = 0;

  while (cursor <= today) {
    if (isScheduledOn(habit, cursor)) {
      expected += 1;
      if (completedSet.has(cursor)) completed += 1;
    }
    cursor = shiftDateKey(cursor, 1);
  }
  return { expected: Math.max(1, expected), completed };
};
