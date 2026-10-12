import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalkthroughPage } from "src/components/pages/WalkthroughPage";
import { UserService } from "src/services/UserService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { renderRoute } from "src/tests/renderRoute";
import { afterEach } from "vitest";
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
} as unknown as Awaited<
  ReturnType<typeof WalkthroughService.getWalkthroughById>
>;

describe("WalkthroughPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.getElementById("root")?.remove();
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

  test("hides the reassign box from other users", async () => {
    vi.spyOn(WalkthroughService, "getWalkthroughById").mockResolvedValue(
      walkthrough,
    );

    renderRoute(<WalkthroughPage />, {
      path: "/walkthroughs/:walkthroughId",
      entry: "/walkthroughs/5",
      user: { id: 2, username: "someone", permissions: [] },
    });

    expect(await screen.findByText(/Step one is easy/)).toBeInTheDocument();
    expect(screen.queryByText(/Not your walkthrough/)).not.toBeInTheDocument();
  });

  test("lets the owner reassign the walkthrough", async () => {
    vi.spyOn(WalkthroughService, "getWalkthroughById").mockResolvedValue(
      walkthrough,
    );
    vi.spyOn(UserService, "searchUsers").mockResolvedValue({
      results: [{ id: 7, username: "rightful_author" }],
    } as unknown as Awaited<ReturnType<typeof UserService.searchUsers>>);
    const reassign = vi
      .spyOn(WalkthroughService, "reassign")
      .mockResolvedValue(undefined);

    renderRoute(<WalkthroughPage />, {
      path: "/walkthroughs/:walkthroughId",
      entry: "/walkthroughs/5",
      user: { id: 1, username: "tester", permissions: [] },
    });

    await userEvent.type(
      await screen.findByPlaceholderText("Search users…"),
      "right",
    );
    await userEvent.click(await screen.findByText("rightful_author"));
    await userEvent.click(screen.getByRole("link", { name: "Assign" }));
    expect(
      screen.getByText(/won't be able to modify the submission/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: /Continue/ }));

    expect(reassign).toHaveBeenCalledWith(5, 7);
    expect(
      await screen.findByText("Walkthrough reassigned to rightful_author."),
    ).toBeInTheDocument();
  });
});
