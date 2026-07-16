import { screen } from "@testing-library/react";
import { WalkthroughEditPage } from "src/components/pages/WalkthroughEditPage";
import { LevelService } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const level = { id: 3814, name: "Test Level" } as unknown as Awaited<
  ReturnType<typeof LevelService.getLevelById>
>;
const editUser = {
  id: 1,
  permissions: [
    UserPermission.postWalkthroughs,
    UserPermission.editWalkthroughs,
  ],
};

describe("WalkthroughEditPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Regression guard: React Query v5 throws when a query function resolves to
  // undefined. The create route has no walkthroughId, so its walkthrough query
  // must not run and the form must render.
  test("renders the create form without a query error", async () => {
    vi.spyOn(LevelService, "getLevelById").mockResolvedValue(level);
    const getWalkthrough = vi.spyOn(WalkthroughService, "getWalkthroughById");

    renderRoute(<WalkthroughEditPage />, {
      path: "/levels/:levelId/walkthrough",
      entry: "/levels/3814/walkthrough",
      user: editUser,
    });

    expect(
      await screen.findByRole("button", { name: "Save draft" }),
    ).toBeInTheDocument();
    expect(getWalkthrough).not.toHaveBeenCalled();
  });

  test("renders the edit form for an existing walkthrough", async () => {
    vi.spyOn(LevelService, "getLevelById").mockResolvedValue(level);
    vi.spyOn(WalkthroughService, "getWalkthroughById").mockResolvedValue({
      id: 5,
      level,
      author: { id: 1 },
      text: "Existing walkthrough",
      status: WalkthroughStatus.Draft,
    } as unknown as Awaited<
      ReturnType<typeof WalkthroughService.getWalkthroughById>
    >);

    renderRoute(<WalkthroughEditPage />, {
      path: "/levels/:levelId/walkthrough/:walkthroughId/edit",
      entry: "/levels/3814/walkthrough/5/edit",
      user: editUser,
    });

    expect(
      await screen.findByRole("button", { name: "Update draft" }),
    ).toBeInTheDocument();
  });
});
