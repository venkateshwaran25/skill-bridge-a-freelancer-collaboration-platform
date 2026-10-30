import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Use relative path so Vite proxy forwards /api to backend automatically
  return "";
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
});

// Auto-attach authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("skillbridge_token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 unauthorized / expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = (error.response.data?.message || "").toLowerCase();
      if (
        msg.includes("token") ||
        msg.includes("session") ||
        msg.includes("not authorized") ||
        msg.includes("expired")
      ) {
        localStorage.removeItem("skillbridge_token");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
