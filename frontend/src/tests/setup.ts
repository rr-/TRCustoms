import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// happy-dom ships no window.alert (jsdom stubs one); provide a noop so code
// paths calling it — and tests spying on it — behave as they do in the browser.
if (typeof window.alert !== "function") {
  window.alert = () => {};
}

// react-testing-library only auto-cleans when Vitest globals are enabled; we
// use explicit imports, so unmount between tests by hand. Also restore any
// vi.spyOn / vi.stubGlobal from the test so it can't leak into the next file —
// per-file isolation is off (see vite.config.js), so a spy left live would
// otherwise poison whichever file shares the worker next.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
