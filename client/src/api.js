import axios from "axios";

export const UNAUTHORIZED_EVENT = "margin:unauthorized";

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
const apiBaseUrl = import.meta.env.DEV
  ? "/api"
  : configuredApiUrl
    ? /\/api$/i.test(configuredApiUrl) ? configuredApiUrl : `${configuredApiUrl}/api`
    : "/api";

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

axiosInstance.defaults.withCredentials = true;

// A 401 outside the auth routes means the session cookie is gone or expired,
// so the app should stop treating the stored user as signed in.
axiosInstance.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401 && !String(error.config?.url || "").startsWith("/auth/")) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  return Promise.reject(error);
});

export default axiosInstance;
