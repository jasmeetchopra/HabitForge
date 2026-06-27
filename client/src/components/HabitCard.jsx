import { Link } from "react-router-dom";
import { formatSchedule } from "../utils/date.js";

// Shows one habit. Receives everything it needs via props and reports user
// actions back up through callbacks - it never talks to the API itself.
export const HabitCard = ({
  habit,
  completedToday = false,
  streak = 0,
  onToggleComplete,
  onDelete,
}) => {
  return (
    <div className={`habit-card${completedToday ? " done" : ""}`}>
      <div className="habit-card-top">
        <div>
          <h3>{habit.title}</h3>
          {habit.description && <p className="desc">{habit.description}</p>}
        </div>
        {streak > 0 && <span className="streak-flame">🔥 {streak}</span>}
      </div>

      <div className="habit-meta">
        <span className="badge">{formatSchedule(habit)}</span>
        {completedToday && (
          <span className="badge" style={{ color: "var(--green)" }}>
            ✓ Done today
          </span>
        )}
      </div>

      <div className="habit-card-actions">
        <button
          className={`btn ${completedToday ? "btn-ghost" : "btn-primary"}`}
          onClick={() => onToggleComplete(habit, completedToday)}
        >
          {completedToday ? "Undo" : "Mark done"}
        </button>
        <Link className="btn" to={`/habits/${habit._id}/edit`}>
          Edit
        </Link>
        <button className="btn btn-danger" onClick={() => onDelete(habit)}>
          Delete
        </button>
      </div>
    </div>
  );
};
