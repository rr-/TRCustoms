// A fetch wrapper that attaches the access token and transparently refreshes
// it on expiry, mirroring the behaviour of the previous request interceptor. It is
// installed on the generated API client via `client.setConfig({ fetch })`.
//
// The logic lives in a factory that takes its dependencies as arguments so it
// can be unit-tested without the real client or auth storage.

export interface AuthHandlers {
  getAccessToken: () => string | null;
  getNewAccessToken: () => Promise<string>;
  logout: () => void;
}

const ACCESS_TOKEN_HEADER = "X-Access-Token";
const LOGOUT_CODES = ["user_not_found", "user_banned", "user_inactive"];

const readErrorCode = async (
  response: Response,
): Promise<string | undefined> => {
  try {
    const data = (await response.clone().json()) as { code?: string };
    return data?.code;
  } catch {
    return undefined;
  }
};

export const createAuthFetch = (
  auth: AuthHandlers,
  baseFetch: typeof fetch = fetch,
): typeof fetch => {
  return async (input, init) => {
    // Materialise the request once so it can be re-issued after a refresh;
    // fetch bodies are single-use, so we buffer non-GET bodies up front.
    const base = new Request(input, init);
    const { url, method, redirect, credentials } = base;
    const headers = new Headers(base.headers);
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await base.arrayBuffer();

    const attempt = (token: string | null): Promise<Response> => {
      const requestHeaders = new Headers(headers);
      if (token) {
        requestHeaders.set(ACCESS_TOKEN_HEADER, `Bearer ${token}`);
      }
      return baseFetch(url, {
        method,
        headers: requestHeaders,
        body: body && body.byteLength ? body : undefined,
        redirect,
        credentials,
      });
    };

    let response = await attempt(auth.getAccessToken());
    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    const code = await readErrorCode(response);
    if (code && LOGOUT_CODES.includes(code)) {
      auth.logout();
      return response;
    }
    if (code === "token_not_valid") {
      try {
        const token = await auth.getNewAccessToken();
        response = await attempt(token);
      } catch {
        auth.logout();
      }
    }
    return response;
  };
};
