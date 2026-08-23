import { api } from "./client";

export const getCompanies = () => api.get("/companies").then((r) => r.data);
export const getCompany = (id) =>
  api.get(`/companies/${id}`, { params: { _embed: "applications" } }).then((r) => r.data);