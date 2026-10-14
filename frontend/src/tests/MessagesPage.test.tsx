import { screen } from "@testing-library/react";
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

const message = {
  id: 3,
  thread_id: 1,
  subject: "Crash after second save crystal",
  sender: { id: 2, username: "alice", picture: null },
  receiver: { id: 1, username: "tester", picture: null },
  text: "It crashes on the **second** floor.",
  created: "2026-10-12T10:00:00Z",
  is_read: false,
  is_replied: false,
};

const mockMessages = (overrides: Record<string, unknown> = {}) =>
  vi.spyOn(MessageService, "searchMessages").mockImplementation(
    async (searchQuery) =>
      ({
        results: [{ ...message, ...overrides }],
        current_page: 1,
        last_page: 1,
        total_count: 1,
        items_on_page: 1,
        searchQuery,
      }) as unknown as Awaited<
        ReturnType<typeof MessageService.searchMessages>
      >,
  );

describe("MessagesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("lists the inbox one message per row", async () => {
    const search = mockMessages();

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: { id: 1, username: "tester", permissions: [] },
    });

    const row = await screen.findByRole("link", { name: /Crash after/ });
    expect(row).toHaveAttribute("href", "/messages/threads/1/3");
    expect(row).toHaveTextContent("alice");
    expect(row).toHaveTextContent("It crashes on the second floor.");
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ box: "inbox", asAdministrator: false }),
    );
    expect(screen.queryByText("Administration inbox")).not.toBeInTheDocument();
  });

  test("shows the receiver in the outbox", async () => {
    const search = mockMessages();

    renderRoute(<MessagesPage />, {
      path: "/messages/:tabName",
      entry: "/messages/outbox",
      user: { id: 1, username: "tester", permissions: [] },
    });

    expect(await screen.findByText("To: tester")).toBeInTheDocument();
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ box: "outbox" }),
    );
  });

  test("shows the Administration mailbox to moderators", async () => {
    const search = mockMessages();

    renderRoute(<MessagesPage />, {
      path: "/messages/:tabName",
      entry: "/messages/administration-inbox",
      user: {
        id: 1,
        username: "tester",
        permissions: ["message_as_administrator"],
      },
    });

    expect(
      await screen.findByRole("link", { name: /Crash after/ }),
    ).toBeInTheDocument();
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ box: "inbox", asAdministrator: true }),
    );
  });

  test("requires logging in", () => {
    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: null,
    });

    expect(screen.queryByText("Inbox")).not.toBeInTheDocument();
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

  test("marks replied messages in the inbox", async () => {
    mockMessages({ is_read: true, is_replied: true });

    renderRoute(<MessagesPage />, {
      path: "/messages",
      entry: "/messages",
      user: { id: 1, username: "tester", permissions: [] },
    });

    expect((await screen.findAllByTitle("Replied")).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText("Unread")).not.toBeInTheDocument();
  });
});
