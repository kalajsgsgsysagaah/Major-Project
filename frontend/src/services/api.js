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

import { generateLocalInvestmentPlan } from "./planner";

/**
 * Check API health
 */
export const checkHealth = () => apiClient.get("/api/v1/health");

/**
 * Submit investment profile and get investment plan.
 * Attempts to call backend if reachable; automatically falls back
 * to local planner calculation if the backend is not running.
 */
export const submitInvestmentProfile = async (profileData) => {
  try {
    const res = await apiClient.post("/api/v1/planner/analyze", profileData, {
      timeout: 3000,
    });
    return res;
  } catch {
    // If backend is not running, compute locally instantly
    const localData = generateLocalInvestmentPlan(profileData);
    return { data: localData };
  }
};

/**
 * Interactive Conversational Agent Turn
 * Sends user message to backend /api/v1/planner/chat
 */
export const sendChatMessage = async (sessionId, message) => {
  try {
    const res = await apiClient.post("/api/v1/planner/chat", {
      session_id: sessionId,
      message: message,
    }, { timeout: 8000 });
    return res.data;
  } catch (err) {
    // If backend is offline, return fallback object
    return null;
  }
};

/**
 * Reset Conversational Agent Session
 */
export const resetChatSession = async (sessionId) => {
  try {
    const res = await apiClient.post("/api/v1/planner/chat/reset", {
      session_id: sessionId,
      message: "",
    }, { timeout: 4000 });
    return res.data;
  } catch {
    return null;
  }
};

export default apiClient;
