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
