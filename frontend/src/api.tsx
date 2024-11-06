import { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { AxiosRequestConfig } from "axios";
import { AuthService } from "src/services/AuthService";

const axios = require("axios");
const api = axios.create();

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean | undefined;
}

api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const accessToken = AuthService.getAccessToken();
    if (accessToken) {
      config.headers = {
        ["X-Access-Token"]: `Bearer ${accessToken}`,
      };
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;
    if (
      error.response?.data.code === "user_not_found" ||
      error.response?.data.code === "user_banned" ||
      error.response?.data.code === "user_inactive"
    ) {
      AuthService.logout();
      return Promise.reject(error);
    } else if (error.response?.data.code === "token_not_valid") {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const accessToken = await AuthService.getNewAccessToken();
          if (accessToken) {
            axios.defaults.headers.common[
              "X-Access-Token"
            ] = `Bearer ${accessToken}`;
          }
        } catch {
          AuthService.logout();
          return Promise.reject(error);
        }
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export { api };
