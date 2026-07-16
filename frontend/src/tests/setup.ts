import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// react-testing-library only auto-cleans when Vitest globals are enabled; we
// use explicit imports, so unmount between tests by hand.
afterEach(() => {
  cleanup();
});
