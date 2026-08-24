// src/api/interviews.js
import { api } from "./client";

export const createInterview = (data) => api.post("/interviews", data).then((r) => r.data);
export const deleteInterview = (id) => api.delete(`/interviews/${id}`);