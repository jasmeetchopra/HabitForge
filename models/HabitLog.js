import mongoose from "mongoose";

// One document = one habit being completed on one specific day.
// We store the date as a plain "YYYY-MM-DD" string so a "day" is
// unambiguous and not affected by time zones or hours/minutes.
const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    // Kept too so we can answer dashboard questions ("all logs for this
    // user") without joining through every habit first.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // e.g. "2025-06-26"
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A habit can only have ONE log per day. This compound unique index
// stops duplicates at the database level, so even buggy code or a
// double-click cannot create two "completed" rows for the same day.
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

const HabitLog = mongoose.model("HabitLog", habitLogSchema);
export default HabitLog;
