import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { message } = await authService.forgotPassword(email);
      setSent(message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="logo">
          <span className="mark">🔥</span> Habit<span className="mark">Forge</span>
        </div>
        <p className="auth-sub">Reset your password</p>
        {sent ? (
          <p
            className="form-error"
            style={{ background: "rgba(67,209,127,.12)", borderColor: "rgba(67,209,127,.3)", color: "#9af3c2" }}
          >
            {sent}
          </p>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="form-error">{error}</div>}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="auth-switch"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
