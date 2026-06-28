import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { dashboardService } from "../services/habitService.js";
import { formatDate } from "../utils/date.js";
import { Loader } from "../components/UI.jsx";
import { ChangePasswordForm } from "../components/ChangePasswordForm.jsx";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardService.get().then((d) => setStats(d.stats));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return <Loader />;

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <main className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Your account and lifetime stats.</p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{initial}</div>
        <div>
          <h3 style={{ fontSize: 20 }}>{user.name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{user.email}</p>
          {user.createdAt && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              Member since {formatDate(user.createdAt.slice(0, 10))}
            </p>
          )}
        </div>
      </div>

      {stats && (
        <>
          <h2 className="section-title">Lifetime stats</h2>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalHabits}</div>
              <div className="stat-label">Total habits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.longestStreak}</div>
              <div className="stat-label">Longest streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Current best streak</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-value">{stats.overallScore}%</div>
              <div className="stat-label">Overall consistency</div>
            </div>
          </div>
        </>
      )}

      <h2 className="section-title">Security</h2>
      <ChangePasswordForm />

      <div style={{ marginTop: 28 }}>
        <button className="btn btn-danger" onClick={handleLogout}>Log out</button>
      </div>
    </main>
  );
}
