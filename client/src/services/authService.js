import api from "./api.js";

// Thin wrappers around the auth endpoints. Keeping API calls in service files
// (instead of inside components) means components stay focused on the UI and
// the network details live in one place.
export const authService = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
  changePassword: (data) => api.put("/auth/change-password", data).then((r) => r.data),
};
