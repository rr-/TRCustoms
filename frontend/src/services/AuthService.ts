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
const postJson = async <T>(path: string, body: unknown): Promise<T> => {
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
  const data = await postJson<AccessTokenResponse>("/auth/token/", {
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
    const data = await postJson<RefreshTokenResponse>("/auth/token/refresh/", {
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
  const refreshToken = getRefreshToken();
  StorageService.removeItem("accessToken");
  StorageService.removeItem("refreshToken");
  if (refreshToken) {
    // Best-effort server-side revocation so the long-lived refresh token
    // can't be reused after logout. Fire and forget: local state is already
    // cleared, and the token may legitimately be invalid/expired.
    void postJson("/auth/token/logout/", { refresh: refreshToken }).catch(
      () => undefined,
    );
  }
};

const AuthService = {
  login,
  logout,
  getAccessToken,
  getRefreshToken,
  getNewAccessToken,
};

export { AuthService };
