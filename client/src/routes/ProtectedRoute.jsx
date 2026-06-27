import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Loader } from "../components/UI.jsx";

// Guards private pages. While we're still checking the session we show a
// loader (so the page doesn't flicker to login on refresh). If there's no
// user, we redirect to /login. Otherwise we render the child routes.
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};
