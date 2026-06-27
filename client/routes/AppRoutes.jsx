import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { AppLayout } from "./AppLayout.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import MyHabits from "../pages/MyHabits.jsx";
import CreateHabit from "../pages/CreateHabit.jsx";
import EditHabit from "../pages/EditHabit.jsx";
import Profile from "../pages/Profile.jsx";
import Todos from "../pages/Todos.jsx";

// All the app's routes in one place. Public routes are listed first; the
// private ones are nested inside <ProtectedRoute> so the guard runs once for
// all of them, and inside <AppLayout> so they share the sidebar/navbar.
export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    {/* Private */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habits" element={<MyHabits />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/habits/new" element={<CreateHabit />} />
        <Route path="/habits/:id/edit" element={<EditHabit />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>

    {/* Anything else goes home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
