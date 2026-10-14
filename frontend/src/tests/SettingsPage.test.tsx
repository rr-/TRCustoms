import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "src/components/pages/SettingsPage";
import { MessageService } from "src/services/MessageService";
import { defaultConfig } from "src/stores/config";
import { useConfig } from "src/stores/config";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const user = { id: 1, username: "tester", permissions: [] };

const enableMessages = () =>
  useConfig.setState({
    config: { ...defaultConfig, features: { messages: true } },
  });

describe("SettingsPage messages section", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    enableMessages();
  });

  test("hides the section while messages are disabled", () => {
    useConfig.setState({ config: defaultConfig });

    renderRoute(<SettingsPage />, {
      path: "/settings",
      entry: "/settings",
      user,
    });

    expect(screen.queryByText("Messages")).not.toBeInTheDocument();
  });

  test("disables messages", async () => {
    vi.spyOn(MessageService, "getSettings").mockResolvedValue({
      allow_messages: true,
      blocked_users: [],
    });
    const update = vi
      .spyOn(MessageService, "updateSettings")
      .mockResolvedValue({ allow_messages: false, blocked_users: [] });

    renderRoute(<SettingsPage />, {
      path: "/settings",
      entry: "/settings",
      user,
    });

    await userEvent.click(await screen.findByLabelText(/Disable messages/));

    expect(update).toHaveBeenCalledWith(false, []);
    expect(screen.getByText(/Blocked users: nobody/)).toBeInTheDocument();
  });

  test("unblocks a user", async () => {
    vi.spyOn(MessageService, "getSettings").mockResolvedValue({
      allow_messages: true,
      blocked_users: [
        { id: 7, username: "pest" },
        { id: 8, username: "spammer" },
      ],
    } as Awaited<ReturnType<typeof MessageService.getSettings>>);
    const update = vi
      .spyOn(MessageService, "updateSettings")
      .mockResolvedValue({ allow_messages: true, blocked_users: [] });

    renderRoute(<SettingsPage />, {
      path: "/settings",
      entry: "/settings",
      user,
    });

    expect(await screen.findByText("pest")).toBeInTheDocument();
    const removeLinks = screen.getAllByRole("link");
    await userEvent.click(
      removeLinks.find((link) =>
        link.closest("li")?.textContent?.includes("pest"),
      )!,
    );

    expect(update).toHaveBeenCalledWith(true, [8]);
  });
});
