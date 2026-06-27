import api from "./api.js";

export const habitService = {
  getAll: () => api.get("/habits").then((r) => r.data),
  getOne: (id) => api.get(`/habits/${id}`).then((r) => r.data),
  create: (data) => api.post("/habits", data).then((r) => r.data),
  update: (id, data) => api.put(`/habits/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/habits/${id}`).then((r) => r.data),
  complete: (id, date) =>
    api.post(`/habits/${id}/complete`, { date }).then((r) => r.data),
  uncomplete: (id, date) =>
    api.delete(`/habits/${id}/complete`, { data: { date } }).then((r) => r.data),
};

export const dashboardService = {
  get: () => api.get("/dashboard").then((r) => r.data),
};
