// A few tiny presentational components grouped in one file. Each is "dumb":
// it only takes props and renders. That makes them reusable anywhere.

export const Loader = () => (
  <div className="loader-wrap">
    <div className="spinner" aria-label="Loading" role="status" />
  </div>
);

export const ProgressBar = ({ value = 0, showLabel = true, label }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {showLabel && (
        <div className="progress-row">
          <span>{label || "Progress"}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const StatCard = ({ icon, value, label, accent = false }) => (
  <div className={`stat-card${accent ? " accent" : ""}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export const EmptyState = ({ icon = "📝", title, message, action }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{message}</p>
    {action && <div style={{ marginTop: 18 }}>{action}</div>}
  </div>
);
