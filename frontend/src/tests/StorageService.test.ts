import { resolveStoredTheme } from "../contexts/themeStorage";
import { getPrefixedKey, StorageService } from "../services/StorageService";
import assert from "node:assert/strict";
import test from "node:test";

interface MockWindow extends Window {
  localStorage: Storage;
  sessionStorage: Storage;
}

const IMPORTED_ACCESS_TOKEN = "test-access.header.payload-signature";
const IMPORTED_REFRESH_TOKEN = "test-refresh.header.payload-signature";

const createStorage = (
  initialData: Record<string, string>,
  options?: { failOnSet?: boolean },
): Storage => {
  const data = new Map(Object.entries(initialData));

  return {
    get length(): number {
      return data.size;
    },
    clear(): void {
      data.clear();
    },
    getItem: (key: string): string | null => {
      return data.get(key) ?? null;
    },
    key: (index: number): string | null => {
      return Array.from(data.keys())[index] ?? null;
    },
    setItem: (key: string, value: string): void => {
      if (options?.failOnSet) {
        throw new Error("storage unavailable");
      }
      data.set(key, value);
    },
    removeItem: (key: string): void => {
      data.delete(key);
    },
  };
};

const setupDom = (windowObject: MockWindow): void => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowObject,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: windowObject.localStorage,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: windowObject.sessionStorage,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      visibilityState: "visible",
      hasFocus: () => true,
    },
  });
};

test("StorageService reads namespaced theme from localStorage when available", () => {
  setupDom({
    localStorage: createStorage({ [getPrefixedKey("theme")]: "candy" }),
    sessionStorage: createStorage({ theme: "midnight_ocean" }),
    location: { pathname: "/settings" } as Location,
  } as MockWindow);

  const storedTheme = StorageService.getItem("theme");

  assert.equal(storedTheme, "candy");
  assert.equal(resolveStoredTheme(storedTheme).stub, "candy");
});

test("StorageService falls back to legacy key when the namespaced key is absent", () => {
  setupDom({
    localStorage: createStorage({ theme: "sundown" }),
    sessionStorage: createStorage({}),
    location: { pathname: "/settings" } as Location,
  } as MockWindow);

  const storedTheme = StorageService.getItem("theme");

  assert.equal(storedTheme, "sundown");
  assert.equal(resolveStoredTheme(storedTheme).stub, "sundown");
});

test("StorageService prefers the namespaced key over the legacy key", () => {
  setupDom({
    localStorage: createStorage({
      [getPrefixedKey("theme")]: "robotic",
      theme: "candy",
    }),
    sessionStorage: createStorage({}),
    location: { pathname: "/settings" } as Location,
  } as MockWindow);

  assert.equal(StorageService.getItem("theme"), "robotic");
});

test("StorageService writes only the namespaced key", () => {
  const localStorageMock = createStorage({});
  const sessionStorageMock = createStorage({});

  setupDom({
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    location: { pathname: "/settings" } as Location,
  } as MockWindow);

  StorageService.setItem("theme", "robotic");

  assert.equal(localStorageMock.getItem(getPrefixedKey("theme")), "robotic");
  assert.equal(localStorageMock.getItem("theme"), null);
  assert.equal(sessionStorageMock.getItem(getPrefixedKey("theme")), "robotic");
  assert.equal(sessionStorageMock.getItem("theme"), null);
});

test("StorageService reads and removes legacy auth tokens from imported local storage", () => {
  const localStorageMock = createStorage({
    accessToken: IMPORTED_ACCESS_TOKEN,
    refreshToken: IMPORTED_REFRESH_TOKEN,
    theme: "Sepia flashback",
  });

  setupDom({
    localStorage: localStorageMock,
    sessionStorage: createStorage({}),
    location: { pathname: "/login" } as Location,
  } as MockWindow);

  assert.equal(
    StorageService.getItem("accessToken"),
    localStorageMock.getItem("accessToken"),
  );
  assert.equal(
    StorageService.getItem("refreshToken"),
    localStorageMock.getItem("refreshToken"),
  );

  StorageService.removeItem("accessToken");
  StorageService.removeItem("refreshToken");

  assert.equal(localStorageMock.getItem("accessToken"), null);
  assert.equal(localStorageMock.getItem("refreshToken"), null);
  assert.equal(localStorageMock.getItem("theme"), "Sepia flashback");
});

test("theme resolution accepts legacy names and defaults only for unknown values", () => {
  assert.equal(resolveStoredTheme("Candy").stub, "candy");
  assert.equal(resolveStoredTheme("does-not-exist").stub, "midnight_ocean");
  assert.equal(resolveStoredTheme(null).stub, "midnight_ocean");
});
