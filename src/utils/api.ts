
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../stores/auth";

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      toast.error("Unauthorized", {
        description: "Please login again",
      });
      useAuth.getState().logout();
    }

    return Promise.reject(error);
  },
);

