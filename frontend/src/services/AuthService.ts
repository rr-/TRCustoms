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

// These calls use the raw fetch rather than the generated client on purpose:
// login carries no token, and the token refresh must not pass through the
// client's auth middleware (which would try to refresh again on failure).
const postJson = async (path: string, body: unknown): Promise<any> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await response.json().catch(() => response.statusText);
  }
  return response.json();
};

const login = async (username: string, password: string): Promise<void> => {
  const data: AccessTokenResponse = await postJson("/auth/token/", {
    username,
    password,
  });
  StorageService.setItem("accessToken", data.access);
  StorageService.setItem("refreshToken", data.refresh);
};

const getAccessToken = (): string | null => {
  return StorageService.getItem("accessToken");
};

const getRefreshToken = (): string | null => {
  return StorageService.getItem("refreshToken");
};

// Single-flight the refresh: concurrent 401s would otherwise each POST to
// /auth/token/refresh/, and if the backend rotates refresh tokens all but the
// first would fail and log the user out. Callers share one in-flight refresh.
let refreshPromise: Promise<string> | null = null;

const getNewAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new AuthError("refresh token not available");
    }
    const data: RefreshTokenResponse = await postJson("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    StorageService.setItem("accessToken", data.access);
    return data.access;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
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
