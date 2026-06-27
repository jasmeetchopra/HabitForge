import { useState } from "react";

// Reusable create/edit form for a todo. Parent owns "what submit does".
export const TodoForm = ({ initial = {}, onSubmit, onCancel, submitLabel = "Save" }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [priority, setPriority] = useState(initial.priority || "medium");
  // <input type="date"> wants YYYY-MM-DD; slice an ISO date if present.
  const [dueDate, setDueDate] = useState(initial.dueDate ? initial.dueDate.slice(0, 10) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Please enter a title");
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save todo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label htmlFor="t-title">Title</label>
        <input id="t-title" className="input" value={title}
          onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Submit assignment" />
      </div>
      <div className="field">
        <label htmlFor="t-desc">Description (optional)</label>
        <textarea id="t-desc" className="textarea" value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="t-priority">Priority</label>
        <select id="t-priority" className="select" value={priority}
          onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="t-due">Due date (optional)</label>
        <input id="t-due" type="date" className="input" value={dueDate}
          onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
};
