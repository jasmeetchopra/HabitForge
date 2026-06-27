import api from "./api.js";

export const analyticsService = {
  get: () => api.get("/analytics").then((r) => r.data),
  getDay: (date) => api.get(`/analytics/day/${date}`).then((r) => r.data),
};
