import axios from "axios";

// In development Vite proxies /api to localhost:5000.
// In production we call the Render backend directly.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export default api;