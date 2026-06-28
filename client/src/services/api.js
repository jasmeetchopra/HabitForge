import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "/api"
      : "https://habit-forge-lime.vercel.app/",

  withCredentials: true,
});

export default api;