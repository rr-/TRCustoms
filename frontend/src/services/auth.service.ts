import { fetchJSONWithoutRetry } from "src/shared/client";
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
  const data = await fetchJSONWithoutRetry<AccessTokenResponse>(
    `${API_URL}/auth/token/`,
    {
      method: "POST",
      data: {
        username: username,
        password: password,
      },
    }
  );
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
};

const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

const getNewAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AuthError("refresh token not available");
  }
  const data = await fetchJSONWithoutRetry<RefreshTokenResponse>(
    `${API_URL}/auth/token/refresh/`,
    {
      method: "POST",
      data: {
        refresh: refreshToken,
      },
    }
  );
  localStorage.setItem("accessToken", data.access);
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
