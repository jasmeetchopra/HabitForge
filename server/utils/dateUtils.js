// Helpers for working with "days". We treat a day as a "YYYY-MM-DD" string
// so comparisons are simple and time zones don't cause off-by-one bugs.

// Turn a Date into "YYYY-MM-DD".
export const toDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Today's key, used as the default "complete this habit" date.
export const todayKey = () => toDateKey(new Date());

// Subtract n days from a date key and return the new key.
export const shiftDateKey = (dateKey, days) => {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

// Given a Set of completed date keys, count the current streak ending today.
// Current streak = how many days in a row, counting back from today, the
// habit was completed. (If today isn't done yet we start counting yesterday,
// so an unfinished today doesn't instantly break a streak.)
export const calcCurrentStreak = (completedKeys) => {
  const set = new Set(completedKeys);
  let streak = 0;
  let cursor = todayKey();

  // If today isn't completed, start from yesterday instead.
  if (!set.has(cursor)) {
    cursor = shiftDateKey(cursor, -1);
  }

  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
};

// Longest streak ever: walk the sorted unique days and find the longest run
// of consecutive calendar days.
export const calcLongestStreak = (completedKeys) => {
  const sorted = [...new Set(completedKeys)].sort();
  let longest = 0;
  let run = 0;
  let prev = null;

  for (const key of sorted) {
    if (prev && shiftDateKey(prev, 1) === key) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = key;
  }
  return longest;
};
