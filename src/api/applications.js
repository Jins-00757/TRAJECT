import { api } from "./client";

// params can include: status, q (full-text search), _sort, _order
export const getApplications = (params = {}) =>
  api.get("/applications", { params: { _expand: "company", ...params } }).then((r) => r.data);

export const getApplication = (id) =>
  api.get(`/applications/${id}`, { params: { _expand: "company", _embed: "interviews" } }).then((r) => r.data);

export const createApplication = (data) => api.post("/applications", data).then((r) => r.data);

export const updateApplication = (id, patch) => api.patch(`/applications/${id}`, patch).then((r) => r.data);

export const deleteApplication = (id) => api.delete(`/applications/${id}`);