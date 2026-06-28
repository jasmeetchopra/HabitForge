import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "/api"
      : "https://habitforge-api-l9en.onrender.com/api",

  withCredentials: true,
});

export default api;