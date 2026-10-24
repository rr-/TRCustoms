import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThreadPage } from "src/components/pages/ThreadPage";
import { MessageService } from "src/services/MessageService";
import type { ThreadDetails } from "src/services/MessageService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const alice = { id: 2, username: "alice", picture: null };
const tester = { id: 1, username: "tester", picture: null };

const makeMessage = (id: number, text: string) => ({
  id,
  sender: id % 2 ? alice : tester,
  receiver: id % 2 ? tester : alice,
  text,
  created: "2026-10-12T10:00:00Z",
  is_read: true,
});

const makeThread = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 1,
    other_user: alice,
    messages: [
      makeMessage(1, "Which engine?"),
      makeMessage(2, "TR4."),
      makeMessage(3, "Send the savegame?"),
      makeMessage(4, "Here it is."),
    ],
    can_reply: true,
    can_mark_unread: true,
    replies_as_administrator: false,
    ...overrides,
  }) as unknown as ThreadDetails;

const mockThread = (
  overrides: Record<string, unknown> = {},
  paging: Record<string, unknown> = {},
) => {
  const { messages, ...thread } = makeThread(overrides) as ThreadDetails & {
    messages: unknown[];
  };
  vi.spyOn(MessageService, "getThread").mockResolvedValue(thread);
  return vi.spyOn(MessageService, "getThreadMessages").mockImplementation(
    async (searchQuery) =>
      ({
        results: messages,
        current_page: 1,
        last_page: 1,
        total_count: messages.length,
        items_on_page: 20,
        disable_paging: false,
        searchQuery,
        ...paging,
      }) as unknown as Awaited<
        ReturnType<typeof MessageService.getThreadMessages>
      >,
  );
};

const renderThread = () =>
  renderRoute(<ThreadPage />, {
    path: "/messages/threads/:threadId",
    entry: "/messages/threads/1",
    user: { id: 1, username: "tester", permissions: [] },
  });

describe("ThreadPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(MessageService, "getSettings").mockResolvedValue({
      allow_messages: true,
      blocked_users: [],
    });
  });

  test("shows the whole conversation oldest first", async () => {
    mockThread();

    renderThread();

    expect(await screen.findByText(/Conversation with/)).toHaveTextContent(
      "Conversation with alice",
    );
    const texts = (await screen.findAllByRole("article")).map(
      (article) => article.textContent,
    );
    expect(texts).toEqual([
      expect.stringContaining("Which engine?"),
      expect.stringContaining("TR4."),
      expect.stringContaining("Send the savegame?"),
      expect.stringContaining("Here it is."),
    ]);
    expect(
      screen.getAllByRole("link", { name: "Mark as unread" }),
    ).toHaveLength(1);
  });

  test("pages back through a long conversation", async () => {
    const getMessages = mockThread({}, { current_page: 2, last_page: 2 });

    renderThread();

    expect(await screen.findByText("Here it is.")).toBeInTheDocument();
    expect(getMessages).toHaveBeenLastCalledWith(
      expect.objectContaining({ threadId: 1, page: null }),
    );

    await userEvent.click(screen.getByRole("link", { name: "Previous page" }));

    await waitFor(() =>
      expect(getMessages).toHaveBeenLastCalledWith(
        expect.objectContaining({ threadId: 1, page: 1 }),
      ),
    );
  });

  test("sends a reply", async () => {
    mockThread();
    const reply = vi
      .spyOn(MessageService, "reply")
      .mockResolvedValue(
        makeMessage(5, "On it.") as unknown as Awaited<
          ReturnType<typeof MessageService.reply>
        >,
      );

    renderThread();

    await userEvent.type(
      await screen.findByLabelText(/Reply to alice/),
      "On it.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send reply" }));

    expect(reply).toHaveBeenCalledWith(1, "On it.");
  });

  test("explains when replying is no longer possible", async () => {
    mockThread({ can_reply: false });

    renderThread();

    expect(
      await screen.findByText("You can no longer reply to this conversation."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Reply to alice/)).not.toBeInTheDocument();
  });

  test("marks the conversation unread", async () => {
    mockThread({ can_mark_unread: true });
    const markUnread = vi
      .spyOn(MessageService, "markUnread")
      .mockResolvedValue(undefined);

    renderThread();

    await userEvent.click(
      await screen.findByRole("link", { name: "Mark as unread" }),
    );

    expect(markUnread).toHaveBeenCalledWith(1);
  });

  test("does not offer marking unread without received messages", async () => {
    mockThread({ can_mark_unread: false });

    renderThread();

    expect(await screen.findByText("Here it is.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Mark as unread" }),
    ).not.toBeInTheDocument();
  });

  test("refreshes the unread indicator once the thread is read", async () => {
    mockThread();
    const getCurrentUser = vi
      .spyOn(UserService, "getCurrentUser")
      .mockResolvedValue({ id: 1 } as UserDetails);

    renderThread();

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
  });
});
