import { useState } from "react";
import { SchedulePicker } from "./SchedulePicker.jsx";

// One form used by BOTH the create and edit pages. The parent passes the
// initial values and what to do on submit, so the form stays reusable.
export const HabitForm = ({ initial = {}, onSubmit, submitLabel = "Save" }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  // Recurrence is grouped into one piece of state so the SchedulePicker can
  // own all three related fields together.
  const [schedule, setSchedule] = useState({
    frequency: initial.frequency || "daily",
    daysOfWeek: initial.daysOfWeek || [],
    interval: initial.interval || 1,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please give your habit a title");
      return;
    }
    if (schedule.frequency === "weekly" && schedule.daysOfWeek.length === 0) {
      setError("Pick at least one day for a weekly habit");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        frequency: schedule.frequency,
        daysOfWeek: schedule.daysOfWeek,
        interval: schedule.interval,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save habit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read 20 minutes"
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why does this habit matter to you?"
        />
      </div>

      <SchedulePicker value={schedule} onChange={setSchedule} />

      <button className="btn btn-primary btn-block" disabled={saving}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
