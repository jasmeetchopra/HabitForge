import api from "./api.js";

export const todoService = {
  getAll: () => api.get("/todos").then((r) => r.data),
  create: (data) => api.post("/todos", data).then((r) => r.data),
  update: (id, data) => api.put(`/todos/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/todos/${id}`).then((r) => r.data),
};
