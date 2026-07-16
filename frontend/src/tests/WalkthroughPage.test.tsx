import { screen } from "@testing-library/react";
import { WalkthroughPage } from "src/components/pages/WalkthroughPage";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const walkthrough = {
  id: 5,
  level: { id: 3814, name: "Test Level", cover: null },
  author: { id: 1, username: "tester", picture: null },
  text: "# My walkthrough\n\nStep one is easy.",
  walkthrough_type: WalkthroughType.Text,
  status: WalkthroughStatus.Approved,
  created: "2024-01-01T00:00:00Z",
  last_updated: "2024-01-01T00:00:00Z",
} as any;

describe("WalkthroughPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the walkthrough content", async () => {
    vi.spyOn(WalkthroughService, "getWalkthroughById").mockResolvedValue(
      walkthrough,
    );

    renderRoute(<WalkthroughPage />, {
      path: "/walkthroughs/:walkthroughId",
      entry: "/walkthroughs/5",
    });

    expect(await screen.findByText(/Step one is easy/)).toBeInTheDocument();
  });
});
