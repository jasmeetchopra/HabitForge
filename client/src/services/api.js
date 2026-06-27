import axios from "axios";

// One configured axios instance used everywhere. Because the backend stores
// the JWT in an httpOnly cookie, we set withCredentials so the browser sends
// that cookie with every request automatically.
const api = axios.create({
  baseURL: "/api", // Vite proxies /api to the backend in dev
  withCredentials: true,
});

export default api;
