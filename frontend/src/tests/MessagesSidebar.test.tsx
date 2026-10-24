import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessagesSidebar } from "src/components/common/MessagesSidebar";
import { defaultThreadSearchQuery } from "src/components/common/MessagesSidebar";
import { MessageService } from "src/services/MessageService";
import { UserService } from "src/services/UserService";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const user = { id: 1, username: "tester", permissions: [] };

type Settings = Awaited<ReturnType<typeof MessageService.getSettings>>;

const renderSidebar = (settings: Partial<Settings> = {}) => {
  vi.spyOn(MessageService, "getSettings").mockResolvedValue({
    allow_messages: true,
    blocked_users: [],
    ...settings,
  } as Settings);
  const update = vi
    .spyOn(MessageService, "updateSettings")
    .mockResolvedValue({ allow_messages: true, blocked_users: [] });
  renderRoute(
    <MessagesSidebar
      searchQuery={defaultThreadSearchQuery}
      onSearchQueryChange={vi.fn()}
    />,
    { path: "/messages", entry: "/messages", user },
  );
  return update;
};

describe("MessagesSidebar settings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("disables receiving messages", async () => {
    const update = renderSidebar();

    await userEvent.click(await screen.findByLabelText("Disabled"));

    expect(update).toHaveBeenCalledWith(false, []);
  });

  test("blocks a user picked from the autocomplete", async () => {
    const update = renderSidebar({
      blocked_users: [{ id: 7, username: "pest" }],
    } as Partial<Settings>);
    vi.spyOn(UserService, "searchUsers").mockResolvedValue({
      results: [
        { id: 7, username: "pest" },
        { id: 9, username: "spammer" },
      ],
    } as unknown as Awaited<ReturnType<typeof UserService.searchUsers>>);

    await userEvent.type(
      await screen.findByPlaceholderText("Start typing to search…"),
      "s",
    );
    await userEvent.click(await screen.findByText("spammer"));

    expect(update).toHaveBeenCalledWith(true, [7, 9]);
  });

  test("unblocks a user", async () => {
    const update = renderSidebar({
      blocked_users: [
        { id: 7, username: "pest" },
        { id: 8, username: "spammer" },
      ],
    } as Partial<Settings>);

    expect(await screen.findByText("pest")).toBeInTheDocument();
    await userEvent.click(
      screen
        .getAllByRole("link")
        .find((link) => link.closest("li")?.textContent?.includes("pest"))!,
    );

    expect(update).toHaveBeenCalledWith(true, [8]);
  });
});
