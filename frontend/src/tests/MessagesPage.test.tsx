import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "src/components/common/NavBar";
import { MessagesPage } from "src/components/pages/MessagesPage";
import { MessageService } from "src/services/MessageService";
import { defaultConfig } from "src/stores/config";
import { useConfig } from "src/stores/config";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const thread = {
  id: 1,
  other_user: { id: 2, username: "alice", picture: null },
  last_message_text: "It crashes on the **second** floor.",
  last_message_at: "2026-10-12T10:00:00Z",
  last_message_is_own: false,
  has_unread: true,
};

const mockThreads = (overrides: Record<string, unknown> = {}) =>
  vi.spyOn(MessageService, "searchThreads").mockImplementation(
    async (searchQuery) =>
      ({
        results: [{ ...thread, ...overrides }],
        current_page: 1,
        last_page: 1,
        total_count: 1,
        items_on_page: 1,
        searchQuery,
      }) as unknown as Awaited<ReturnType<typeof MessageService.searchThreads>>,
  );

const mockSettings = () =>
  vi.spyOn(MessageService, "getSettings").mockResolvedValue({
    allow_messages: true,
    blocked_users: [],
  });

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("lists one row per contact", async () => {
    const search = mockThreads();
    mockSettings();

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: { id: 1, username: "tester", permissions: [] },
    });

    expect(await screen.findByRole("link", { name: /alice/ })).toHaveAttribute(
      "href",
      "/messages/threads/1",
    );
    expect(
      screen.getByRole("link", { name: "It crashes on the second floor." }),
    ).toHaveAttribute("href", "/messages/threads/1");
    expect(screen.getByLabelText("Unread")).toBeInTheDocument();
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ asAdministrator: false }),
    );
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  test("searches conversations", async () => {
    const search = mockThreads();
    mockSettings();

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: { id: 1, username: "tester", permissions: [] },
    });

    await userEvent.type(await screen.findByLabelText(/Search/), "crash");
    await userEvent.keyboard("{Enter}");

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "crash" }),
      ),
    );
  });

  test("switches moderators to the Administration mailbox", async () => {
    const search = mockThreads();
    mockSettings();

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: {
        id: 1,
        username: "tester",
        permissions: ["message_as_administrator"],
      },
    });

    await userEvent.click(await screen.findByLabelText("Administration"));

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith(
        expect.objectContaining({ asAdministrator: true }),
      ),
    );
  });

  test("requires logging in", () => {
    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: null,
    });

    expect(screen.queryByText("Filter messages")).not.toBeInTheDocument();
  });

  test("flags unread messages in the navigation bar", () => {
    useConfig.setState({
      config: { ...defaultConfig, features: { messages: true } },
    });
    renderRoute(<NavBar />, {
      path: "/",
      entry: "/",
      user: {
        id: 1,
        username: "tester",
        permissions: [],
        has_unread_messages: true,
      },
    });

    expect(screen.getByLabelText("New messages")).toBeInTheDocument();
  });

  test("hides messages from the navigation bar while disabled", () => {
    renderRoute(<NavBar />, {
      path: "/",
      entry: "/",
      user: {
        id: 1,
        username: "tester",
        permissions: [],
        has_unread_messages: true,
      },
    });

    expect(screen.queryByText("Messages")).not.toBeInTheDocument();
  });

  test("marks conversations where the last message is own", async () => {
    mockThreads({ has_unread: false, last_message_is_own: true });
    mockSettings();

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: { id: 1, username: "tester", permissions: [] },
    });

    expect(await screen.findByTitle("Replied")).toBeInTheDocument();
    expect(screen.queryByLabelText("Unread")).not.toBeInTheDocument();
  });
});
