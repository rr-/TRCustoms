import { type AuthHandlers, createAuthFetch } from "../services/authFetch";
import assert from "node:assert";
import { test } from "vitest";

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const handlers = (over: Partial<AuthHandlers> = {}): AuthHandlers => ({
  getAccessToken: () => "access",
  getNewAccessToken: async () => "refreshed",
  logout: () => {},
  ...over,
});

test("attaches the access token as a bearer header", async () => {
  const seen: (string | null)[] = [];
  const fetchMock = (async (_url: string, init: RequestInit) => {
    seen.push(new Headers(init.headers).get("X-Access-Token"));
    return jsonResponse(200, {});
  }) as unknown as typeof fetch;

  await createAuthFetch(handlers(), fetchMock)("http://x/api/thing");

  assert.equal(seen[0], "Bearer access");
});

test("refreshes the token and retries once on token_not_valid", async () => {
  const tokens: (string | null)[] = [];
  let calls = 0;
  const fetchMock = (async (_url: string, init: RequestInit) => {
    tokens.push(new Headers(init.headers).get("X-Access-Token"));
    calls += 1;
    return calls === 1
      ? jsonResponse(401, { code: "token_not_valid" })
      : jsonResponse(200, { ok: true });
  }) as unknown as typeof fetch;

  const response = await createAuthFetch(
    handlers({ getAccessToken: () => "stale" }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(calls, 2);
  assert.equal(response.status, 200);
  assert.deepEqual(tokens, ["Bearer stale", "Bearer refreshed"]);
});

test("logs out on a banned/inactive user without retrying", async () => {
  let loggedOut = false;
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return jsonResponse(403, { code: "user_banned" });
  }) as unknown as typeof fetch;

  await createAuthFetch(
    handlers({ logout: () => (loggedOut = true) }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(loggedOut, true);
  assert.equal(calls, 1);
});

test("logs out and returns the original response when refresh fails", async () => {
  let loggedOut = false;
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return jsonResponse(401, { code: "token_not_valid" });
  }) as unknown as typeof fetch;

  const response = await createAuthFetch(
    handlers({
      getNewAccessToken: async () => {
        throw new Error("refresh token expired");
      },
      logout: () => (loggedOut = true),
    }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(loggedOut, true);
  assert.equal(calls, 1);
  assert.equal(response.status, 401);
});

test("re-sends the request body on the retried request", async () => {
  const bodies: (string | null)[] = [];
  let calls = 0;
  const fetchMock = (async (_url: string, init: RequestInit) => {
    bodies.push(
      init.body ? new TextDecoder().decode(init.body as ArrayBuffer) : null,
    );
    calls += 1;
    return calls === 1
      ? jsonResponse(401, { code: "token_not_valid" })
      : jsonResponse(200, { ok: true });
  }) as unknown as typeof fetch;

  const response = await createAuthFetch(handlers(), fetchMock)(
    "http://x/api/thing",
    {
      method: "POST",
      body: JSON.stringify({ name: "value" }),
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(bodies, ['{"name":"value"}', '{"name":"value"}']);
});

test("passes non-auth error responses through without refreshing", async () => {
  let refreshed = false;
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return jsonResponse(500, { detail: "boom" });
  }) as unknown as typeof fetch;

  const response = await createAuthFetch(
    handlers({
      getNewAccessToken: async () => {
        refreshed = true;
        return "refreshed";
      },
    }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(response.status, 500);
  assert.equal(calls, 1);
  assert.equal(refreshed, false);
});

test("leaves a 401 with an unrelated code untouched", async () => {
  let refreshed = false;
  let loggedOut = false;
  let calls = 0;
  const fetchMock = (async () => {
    calls += 1;
    return jsonResponse(401, { code: "permission_denied" });
  }) as unknown as typeof fetch;

  const response = await createAuthFetch(
    handlers({
      getNewAccessToken: async () => {
        refreshed = true;
        return "refreshed";
      },
      logout: () => (loggedOut = true),
    }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(response.status, 401);
  assert.equal(calls, 1);
  assert.equal(refreshed, false);
  assert.equal(loggedOut, false);
});

test("omits the auth header when there is no access token", async () => {
  const seen: (string | null)[] = [];
  const fetchMock = (async (_url: string, init: RequestInit) => {
    seen.push(new Headers(init.headers).get("X-Access-Token"));
    return jsonResponse(200, {});
  }) as unknown as typeof fetch;

  await createAuthFetch(
    handlers({ getAccessToken: () => null }),
    fetchMock,
  )("http://x/api/thing");

  assert.equal(seen[0], null);
});
