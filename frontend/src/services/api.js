/**
 * Axios API Client
 * Centralized HTTP client for all backend API calls.
 * Base URL is read from the VITE_API_BASE_URL environment variable.
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes — AI workflow needs time
});

// ── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Future: attach auth tokens here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

// ── API Methods (to be expanded in later phases) ──────────────────────────────

/**
 * Check API health
 */
export const checkHealth = () => apiClient.get("/api/v1/health");

/**
 * Submit investment profile and get AI plan
 * (Placeholder — will be implemented in Phase 2)
 */
export const submitInvestmentProfile = (profileData) =>
  apiClient.post("/api/v1/planner/analyze", profileData);

export default apiClient;
