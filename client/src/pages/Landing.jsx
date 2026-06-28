import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Landing() {
  const { user, loading } = useAuth();

  // If you're already logged in, skip the marketing page.
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19 }}>
          <span style={{ color: "var(--ember)" }}>🔥</span> Habit
          <span style={{ color: "var(--ember)" }}>Forge</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn btn-ghost" to="/login">Log in</Link>
          <Link className="btn btn-primary" to="/register">Get started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <span className="eyebrow">Consistency, forged daily</span>
        <h1>
          Build habits that <span className="mark">stick</span>.
        </h1>
        <p>
          Track daily habits, keep your streaks alive, and watch your
          consistency grow on a heatmap that lights up as you show up.
        </p>
        <div className="landing-cta">
          <Link className="btn btn-primary" to="/register">Start forging</Link>
          <Link className="btn btn-ghost" to="/login">I already have an account</Link>
        </div>
      </section>
    </div>
  );
}
