import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // --- Recurrence (Phase 2) ---
    // daily  -> every day
    // weekly -> on specific weekday(s) in daysOfWeek (e.g. Mon/Wed/Fri, weekends)
    // custom -> either specific weekday(s) OR "every N days" via interval
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    // 0 = Sunday ... 6 = Saturday. Empty means "not weekday-based".
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator: (arr) => arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "daysOfWeek values must be integers 0-6",
      },
    },
    // "every N days", counted from the habit's creation date. Min 1.
    interval: {
      type: Number,
      default: 1,
      min: [1, "interval must be at least 1"],
    },
  },
  { timestamps: true }
);

const Habit = mongoose.model("Habit", habitSchema);
export default Habit;
