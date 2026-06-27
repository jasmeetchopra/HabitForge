import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";

// AuthContext holds the logged-in user. This is GLOBAL state because many
// unrelated parts of the app need it: the navbar, route guards, the profile
// page. Passing it down through props would be painful, so it lives here.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // "loading" is true until we've checked whether a cookie session exists.
  // Without it, protected routes would flash to the login page on refresh.
  const [loading, setLoading] = useState(true);

  // On first load, ask the server "who am I?". If the cookie is valid we get
  // the user back; if not, we stay logged out.
  useEffect(() => {
    authService
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await authService.register(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = { user, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
