import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:8080"
    : import.meta.env.VITE_API_URL,
});

export default api;