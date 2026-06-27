// Tiny hand-written validators. We avoid extra libraries so a beginner can
// read exactly what is being checked. Each function throws a 400 error that
// the error middleware turns into JSON.

const fail = (res, message) => {
  res.status(400);
  throw new Error(message);
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateRegister = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    fail(res, "Name, email and password are all required");
  }
  if (!isValidEmail(email)) {
    fail(res, "Please enter a valid email address");
  }
  if (password.length < 6) {
    fail(res, "Password must be at least 6 characters");
  }
};

export const validateLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    fail(res, "Email and password are required");
  }
};

export const validateHabit = (req, res) => {
  const { title, frequency, daysOfWeek, interval } = req.body;
  if (!title || !title.trim()) {
    fail(res, "Habit title is required");
  }
  if (frequency && !["daily", "weekly", "custom"].includes(frequency)) {
    fail(res, "Frequency must be 'daily', 'weekly', or 'custom'");
  }
  if (daysOfWeek !== undefined) {
    if (!Array.isArray(daysOfWeek) || !daysOfWeek.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) {
      fail(res, "daysOfWeek must be an array of integers 0-6");
    }
  }
  if (interval !== undefined && (!Number.isInteger(interval) || interval < 1)) {
    fail(res, "interval must be a whole number of at least 1");
  }
  // A weekly habit needs at least one weekday selected.
  if (frequency === "weekly" && Array.isArray(daysOfWeek) && daysOfWeek.length === 0) {
    fail(res, "Pick at least one day of the week for a weekly habit");
  }
};

// --- Password flow validators (NEW) ---
export const validateForgot = (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    fail(res, "Please enter a valid email address");
  }
};

export const validateNewPassword = (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    fail(res, "New password must be at least 6 characters");
  }
};

export const validateChangePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    fail(res, "Current and new password are both required");
  }
  if (newPassword.length < 6) {
    fail(res, "New password must be at least 6 characters");
  }
};

// --- Todo validator (Phase 3) ---
export const validateTodo = (req, res) => {
  const { title, priority, dueDate } = req.body;
  if (!title || !title.trim()) {
    fail(res, "Todo title is required");
  }
  if (priority && !["low", "medium", "high"].includes(priority)) {
    fail(res, "Priority must be 'low', 'medium', or 'high'");
  }
  if (dueDate !== undefined && dueDate !== null && dueDate !== "" && isNaN(Date.parse(dueDate))) {
    fail(res, "dueDate must be a valid date");
  }
};
