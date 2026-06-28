import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    setBusy(true);
    setError("");
    try {
      await authService.resetPassword(token, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
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
        <p className="auth-sub">Choose a new password</p>
        <form onSubmit={submit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="password">New password</label>
            <input id="password" type="password" className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" className="input" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Resetting…" : "Reset password"}
          </button>
        </form>
        <p className="auth-switch"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
