import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import { StorageService } from "src/services/StorageService";

interface AccessTokenResponse {
  access: string;
  refresh: string;
}

interface RefreshTokenResponse {
  access: string;
}

class AuthError extends Error {}

const login = async (username: string, password: string) => {
  const data = {
    username: username,
    password: password,
  };
  const response = (await api.post(
    `${API_URL}/auth/token/`,
    data
  )) as AxiosResponse<AccessTokenResponse>;
  StorageService.setItem("accessToken", response.data.access);
  StorageService.setItem("refreshToken", response.data.refresh);
};

const getAccessToken = (): string | null => {
  return StorageService.getItem("accessToken");
};

const getRefreshToken = (): string | null => {
  return StorageService.getItem("refreshToken");
};

const getNewAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AuthError("refresh token not available");
  }
  const data = { refresh: refreshToken };
  const response = (await api.post(
    `${API_URL}/auth/token/refresh/`,
    data
  )) as AxiosResponse<RefreshTokenResponse>;
  StorageService.setItem("accessToken", response.data.access);
  return response.data.access;
};

const logout = () => {
  StorageService.removeItem("accessToken");
  StorageService.removeItem("refreshToken");
};

const AuthService = {
  login,
  logout,
  getAccessToken,
  getRefreshToken,
  getNewAccessToken,
};

export { AuthService };
