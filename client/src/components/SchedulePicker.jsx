import { DAY_LABELS } from "../utils/date.js";

// A controlled recurrence picker. It's "dumb": the parent owns the values
// (frequency, daysOfWeek, interval) and passes onChange. That keeps it
// reusable in both the create and edit forms with no internal duplication.
export const SchedulePicker = ({ value, onChange }) => {
  const { frequency, daysOfWeek = [], interval = 1 } = value;

  const set = (patch) => onChange({ ...value, ...patch });

  const toggleDay = (d) => {
    const next = daysOfWeek.includes(d)
      ? daysOfWeek.filter((x) => x !== d)
      : [...daysOfWeek, d].sort((a, b) => a - b);
    set({ daysOfWeek: next });
  };

  // "custom" splits into two sub-modes: specific weekdays, or every-N-days.
  // We infer the mode from whether daysOfWeek has entries.
  const customMode = daysOfWeek.length ? "days" : "interval";

  return (
    <div>
      <div className="field">
        <label>Frequency</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["daily", "weekly", "custom"].map((f) => (
            <button
              type="button"
              key={f}
              className={`btn ${frequency === f ? "btn-primary" : "btn-ghost"}`}
              onClick={() =>
                set({
                  frequency: f,
                  // sensible defaults when switching modes
                  daysOfWeek: f === "weekly" ? (daysOfWeek.length ? daysOfWeek : [1]) : f === "daily" ? [] : daysOfWeek,
                  interval: f === "custom" ? interval : 1,
                })
              }
              style={{ textTransform: "capitalize", flex: 1 }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly always picks weekdays */}
      {frequency === "weekly" && (
        <div className="field">
          <label>On these days</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DAY_LABELS.map((label, d) => (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(d)}
                className={`btn ${daysOfWeek.includes(d) ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "8px 10px", minWidth: 46 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom: choose between specific days or an interval */}
      {frequency === "custom" && (
        <div className="field">
          <label>Custom schedule</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              className={`btn ${customMode === "days" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => set({ daysOfWeek: daysOfWeek.length ? daysOfWeek : [1], interval: 1 })}
              style={{ flex: 1 }}
            >
              Specific days
            </button>
            <button
              type="button"
              className={`btn ${customMode === "interval" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => set({ daysOfWeek: [], interval: Math.max(2, interval) })}
              style={{ flex: 1 }}
            >
              Every N days
            </button>
          </div>

          {customMode === "days" ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAY_LABELS.map((label, d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`btn ${daysOfWeek.includes(d) ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "8px 10px", minWidth: 46 }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Every</span>
              <input
                type="number"
                min="2"
                className="input"
                style={{ width: 90 }}
                value={interval}
                onChange={(e) => set({ interval: Math.max(2, Number(e.target.value) || 2) })}
              />
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>days</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
