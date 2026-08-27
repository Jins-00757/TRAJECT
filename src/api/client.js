import axios from "axios";

// Use Render backend in production, localhost in development
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:5005" 
    : "https://traject-va0w.onrender.com/");

export const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => { 
    console.error("API error:", err.response?.status, err.message); 
    return Promise.reject(err); 
  }
);