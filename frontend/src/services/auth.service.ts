import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";

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
  localStorage.setItem("accessToken", response.data.access);
  localStorage.setItem("refreshToken", response.data.refresh);
};

const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
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
  localStorage.setItem("accessToken", response.data.access);
  return response.data.access;
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const AuthService = {
  login,
  logout,
  getAccessToken,
  getRefreshToken,
  getNewAccessToken,
};

export { AuthService };
