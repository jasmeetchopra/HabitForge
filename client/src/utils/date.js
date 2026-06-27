// Mirror of the server's day logic so the UI agrees with the API on what
// "today" means.
export const toDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const todayKey = () => toDateKey(new Date());

// "2025-06-26" -> "Jun 26, 2025"
export const formatDate = (key) => {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// --- Recurrence display helpers (Phase 2) ---
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Turns a habit's recurrence settings into a short human label for cards.
export const formatSchedule = (habit) => {
  if (!habit) return "";
  if (habit.frequency === "daily") return "Daily";

  const days = habit.daysOfWeek || [];
  if (days.length) {
    const sorted = [...days].sort((a, b) => a - b);
    const key = sorted.join(",");
    if (key === "0,6") return "Weekends";
    if (key === "1,2,3,4,5") return "Weekdays";
    if (sorted.length === 7) return "Daily";
    return sorted.map((d) => DAY_LABELS[d]).join(", ");
  }

  const n = habit.interval || 1;
  return n <= 1 ? "Daily" : `Every ${n} days`;
};
