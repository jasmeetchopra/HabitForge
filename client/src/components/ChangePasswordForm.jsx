import { useState } from "react";
import { authService } from "../services/authService.js";

export const ChangePasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return setMsg({ ok: false, text: "New password must be at least 6 characters" });
    if (form.newPassword !== form.confirm) return setMsg({ ok: false, text: "New passwords don't match" });
    setBusy(true);
    setMsg(null);
    try {
      const { message } = await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg({ ok: true, text: message });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Could not change password" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginBottom: 14 }}>Change password</h3>
      {msg && (
        <div
          className="form-error"
          style={msg.ok ? { background: "rgba(67,209,127,.12)", borderColor: "rgba(67,209,127,.3)", color: "#9af3c2" } : {}}
        >
          {msg.text}
        </div>
      )}
      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" className="input"
          value={form.currentPassword} onChange={change} />
      </div>
      <div className="field">
        <label htmlFor="newPassword">New password</label>
        <input id="newPassword" name="newPassword" type="password" className="input"
          value={form.newPassword} onChange={change} />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm new password</label>
        <input id="confirm" name="confirm" type="password" className="input"
          value={form.confirm} onChange={change} />
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
    </form>
  );
};
