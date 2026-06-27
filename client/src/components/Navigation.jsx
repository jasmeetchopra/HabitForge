import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Top navigation bar (replaces the old sidebar). Visible on every logged-in
// page: logo + primary links on the left, a clickable profile shortcut and
// logout on the right.
export const TopNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/habits", label: "Habits" },
    { to: "/todos", label: "Todos" },
  ];

  return (
    <header className="topnav">
      <div className="topnav-left">
        <Link to="/dashboard" className="topnav-logo">
          <span className="mark">🔥</span> Habit<span className="mark">Forge</span>
        </Link>
        <nav className="topnav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/habits"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="topnav-right">
        {/* Whole chip is a link to the profile: avatar AND name are clickable,
            with a pointer cursor, hover state, and an accessible label. */}
        <Link to="/profile" className="user-chip" aria-label="Open your profile">
          <div className="avatar">{initial}</div>
          <span className="user-name">{user?.name}</span>
        </Link>
        <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
};
