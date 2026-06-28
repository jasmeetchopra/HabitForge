import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { dashboardService, habitService } from "../services/habitService.js";
import { analyticsService } from "../services/analyticsService.js";
import { useHabits } from "../hooks/useHabits.js";
import { useTodos } from "../hooks/useTodos.js";
import { StatCard, Loader, EmptyState } from "../components/UI.jsx";
import { HabitCard } from "../components/HabitCard.jsx";
import { CalendarHeatmap } from "../components/CalendarHeatmap.jsx";
import { DayDetailModal } from "../components/DayDetailModal.jsx";
import { ConsistencyBarChart, TrendLineChart, CompletionPieChart } from "../components/Charts.jsx";
import { todayKey } from "../utils/date.js";

// Small inline "quick add" widget reused for habits and todos.
const QuickAdd = ({ placeholder, onAdd }) => {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try { await onAdd(value.trim()); setValue(""); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
      <input className="input" value={value} placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)} />
      <button className="btn btn-primary" disabled={busy}>Add</button>
    </form>
  );
};

export default function Dashboard() {
  const { addHabit } = useHabits();
  const { todos, loadTodos, addTodo, toggleTodo } = useTodos();

  const [dash, setDash] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);

  const load = useCallback(async () => {
    const [d, a] = await Promise.all([dashboardService.get(), analyticsService.get()]);
    setDash(d);
    setAnalytics(a);
    setLoading(false);
  }, []);

  useEffect(() => { load(); loadTodos(); }, [load, loadTodos]);

  const toggleHabit = async (habit, isDone) => {
    if (isDone) await habitService.uncomplete(habit._id);
    else await habitService.complete(habit._id);
    await load();
  };

  const quickAddHabit = async (title) => { await addHabit({ title, frequency: "daily" }); await load(); };
  const quickAddTodo = async (title) => { await addTodo({ title, priority: "medium" }); };

  if (loading || !dash || !analytics) return <Loader />;

  const { stats } = dash;
  const scheduledHabits = dash.habits.filter((h) => h.scheduledToday);
  const doneCount = scheduledHabits.filter((h) => h.completedToday).length;
  const pendingTodos = todos.filter((t) => !t.completed).slice(0, 5);
  const { summary, byHabit, monthly, heatmap, todoStats } = analytics;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Everything at a glance.</p>
        </div>
        <Link className="btn btn-ghost" to="/habits">Manage habits</Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard icon="🔥" value={summary.currentStreak} label="Current streak (days)" accent />
        <StatCard icon="🏆" value={summary.longestStreak} label="Longest streak" />
        <StatCard icon="📈" value={`${stats.completionRate}%`} label="Completion today" />
        <StatCard icon="📚" value={summary.totalHabits} label="Total habits" />
      </div>

      {/* Quick adds */}
      <div className="grid-2" style={{ marginBottom: 6 }}>
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Quick add habit</h3>
          <QuickAdd placeholder="New daily habit…" onAdd={quickAddHabit} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Quick add todo</h3>
          <QuickAdd placeholder="New todo…" onAdd={quickAddTodo} />
        </div>
      </div>

      <div className="grid-2">
        {/* LEFT: today's habits + todos */}
        <div>
          <h2 className="section-title">Today's habits</h2>
          {scheduledHabits.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>Nothing scheduled today. 🎉</p>
          ) : (
            <div className="habit-grid">
              {scheduledHabits.map((h) => (
                <HabitCard key={h._id} habit={h} completedToday={h.completedToday}
                  streak={h.currentStreak} onToggleComplete={toggleHabit} onDelete={() => {}} />
              ))}
            </div>
          )}

          <h2 className="section-title">Today's todos</h2>
          <div className="card">
            {pendingTodos.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No pending todos. <Link to="/todos" style={{ color: "var(--ember)" }}>Open todos →</Link></p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingTodos.map((t) => (
                  <div key={t._id} className="todo-item" style={{ padding: "10px 12px" }}>
                    <button className="todo-check" aria-label="Complete" onClick={() => toggleTodo(t)} />
                    <div className="todo-body">
                      <div className="todo-title">{t.title}</div>
                    </div>
                    <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                  </div>
                ))}
                <Link to="/todos" style={{ color: "var(--ember)", fontSize: 13, marginTop: 4 }}>View all todos →</Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: insights */}
        <div>
          <h2 className="section-title">At a glance</h2>
          <div className="card">
            <div className="consistency-row">
              <span>Overall consistency</span>
              <span className="consistency-score">{summary.overallScore}%</span>
            </div>
            <div className="consistency-row">
              <span>Most completed</span>
              <span className="consistency-score">{summary.mostCompleted?.title || "—"}</span>
            </div>
            <div className="consistency-row">
              <span>Missed today</span>
              <span className="consistency-score" style={{ color: summary.missedCount ? "var(--red)" : "var(--green)" }}>
                {summary.missedCount}
              </span>
            </div>
            <div className="consistency-row">
              <span>Todos (done / total)</span>
              <span className="consistency-score">{todoStats.completed}/{todoStats.total}</span>
            </div>
            {todoStats.overdue > 0 && (
              <div className="consistency-row">
                <span>Overdue todos</span>
                <span className="consistency-score" style={{ color: "var(--red)" }}>{todoStats.overdue}</span>
              </div>
            )}
          </div>

          <h2 className="section-title">Today's progress</h2>
          <div className="card">
            <CompletionPieChart done={doneCount} remaining={scheduledHabits.length - doneCount} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <h2 className="section-title">Consistency by habit</h2>
      <div className="card"><ConsistencyBarChart data={byHabit} /></div>

      <h2 className="section-title">Last 30 days</h2>
      <div className="card"><TrendLineChart data={monthly} /></div>

      {/* Heatmap (365 days, click a day for detail) */}
      <h2 className="section-title">Activity — past year</h2>
      <div className="card">
        <CalendarHeatmap data={heatmap} onDayClick={(day) => setActiveDay(day.date)} />
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 10 }}>Tip: click any day to see what you completed.</p>
      </div>

      <DayDetailModal date={activeDay} onClose={() => setActiveDay(null)} />
    </main>
  );
}
