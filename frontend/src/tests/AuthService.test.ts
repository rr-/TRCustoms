import { AuthService } from "../services/AuthService";
import { StorageService } from "../services/StorageService";
import { useUser } from "../stores/user";
import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  StorageService.removeItem("accessToken");
  StorageService.removeItem("refreshToken");
});

test("logout clears tokens and revokes the refresh token", async () => {
  StorageService.setItem("accessToken", "acc");
  StorageService.setItem("refreshToken", "ref");

  const calls: { url: string; body: unknown }[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((async (
    url: string,
    init: RequestInit,
  ) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch);

  AuthService.logout();

  assert.equal(StorageService.getItem("accessToken"), null);
  assert.equal(StorageService.getItem("refreshToken"), null);

  await vi.waitFor(() => assert.equal(calls.length, 1));
  assert.match(calls[0].url, /\/auth\/token\/logout\/$/);
  assert.deepEqual(calls[0].body, { refresh: "ref" });
});

test("logout without a refresh token does not call the server", () => {
  const fetchMock = vi.spyOn(globalThis, "fetch");

  AuthService.logout();

  assert.equal(fetchMock.mock.calls.length, 0);
});

test("logout clears the user store (forced-logout path)", () => {
  useUser.setState({ user: { id: 1 } as never });

  AuthService.logout();

  assert.equal(useUser.getState().user, null);
});
