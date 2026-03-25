import axios from "axios";
import { BACKEND_URL } from "./backendBase.js";

const TOKEN_KEY = "authToken";

function redirectToLogin() {
  // HashRouter uses `#/login`.
  window.location.hash = "#/login";
}

export function createHttpClient(baseURL = BACKEND_URL) {
  const client = axios.create({
    baseURL,
    timeout: 15000,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        "Request failed.";

      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        redirectToLogin();
      }

      if (status === 403) {
        // Keep user on page; we'll surface friendly error message.
        return Promise.reject(new Error(message));
      }

      if (!status) {
        // Network/timeout
        return Promise.reject(new Error("Network error. Please try again."));
      }

      return Promise.reject(new Error(message));
    }
  );

  return client;
}

