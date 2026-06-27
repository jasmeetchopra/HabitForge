import { useEffect, useState } from "react";
import { analyticsService } from "../services/analyticsService.js";
import { formatDate } from "../utils/date.js";
import { Loader } from "./UI.jsx";

// Fetches and shows what happened on a single day when a heatmap cell is
// clicked: completed habits, missed habits, and todos completed.
export const DayDetailModal = ({ date, onClose }) => {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!date) return;
    setDetail(null);
    analyticsService.getDay(date).then(setDetail).catch(() => setDetail({ error: true }));
  }, [date]);

  if (!date) return null;

  const Section = ({ title, items, color }) => (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color }}>{title} ({items?.length || 0})</div>
      {items && items.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", fontSize: 14 }}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>None</p>
      )}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{formatDate(date)}</h3>
        {!detail ? (
          <Loader />
        ) : detail.error ? (
          <p className="form-error">Could not load that day.</p>
        ) : (
          <>
            <Section title="✅ Completed habits" items={detail.completedHabits} color="var(--green)" />
            <Section title="✗ Missed habits" items={detail.missedHabits} color="var(--red)" />
            <Section title="📝 Todos completed" items={detail.completedTodos} color="var(--ember)" />
          </>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
