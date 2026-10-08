import axios from "axios";

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

export default axiosInstance;
