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
    subject: "Crash after second save crystal",
    other_user: alice,
    messages: [
      makeMessage(4, "Here it is."),
      makeMessage(3, "Send the savegame?"),
      makeMessage(2, "TR4."),
      makeMessage(1, "Which engine?"),
    ],
    can_reply: true,
    replies_as_administrator: false,
    ...overrides,
  }) as unknown as ThreadDetails;

const renderThread = (entry = "/messages/threads/1") =>
  renderRoute(<ThreadPage />, {
    path:
      entry.split("/").length > 4
        ? "/messages/threads/:threadId/:messageId"
        : "/messages/threads/:threadId",
    entry,
    user: { id: 1, username: "tester", permissions: [] },
  });

describe("ThreadPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("shows the latest message and folds the history", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(makeThread());

    renderThread();

    expect(await screen.findByText("Here it is.")).toBeInTheDocument();
    expect(screen.queryByText("Which engine?")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Show earlier messages" }),
    );

    expect(screen.getByText("Send the savegame?")).toBeInTheDocument();
    expect(screen.getByText("Which engine?")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /alice|tester/ })).toHaveLength(
      5,
    );
  });

  test("opens an older message with a pointer to newer ones", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(makeThread());

    renderThread("/messages/threads/1/2");

    expect(await screen.findByText("TR4.")).toBeInTheDocument();
    expect(screen.queryByText("Here it is.")).not.toBeInTheDocument();
    expect(screen.getByText(/There are 2 newer messages/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Show the latest" }),
    ).toHaveAttribute("href", "/messages/threads/1");
  });

  test("sends a reply", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(makeThread());
    const reply = vi
      .spyOn(MessageService, "reply")
      .mockResolvedValue(
        makeMessage(5, "On it.") as unknown as Awaited<
          ReturnType<typeof MessageService.reply>
        >,
      );

    renderThread();

    await userEvent.click(await screen.findByRole("link", { name: "Reply" }));
    await userEvent.type(screen.getByLabelText(/Reply to alice/), "On it.");
    await userEvent.click(screen.getByRole("button", { name: "Send reply" }));

    expect(reply).toHaveBeenCalledWith(1, "On it.");
  });

  test("explains when replying is no longer possible", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(
      makeThread({ can_reply: false }),
    );

    renderThread();

    expect(
      await screen.findByText("You can no longer reply to this conversation."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Reply" }),
    ).not.toBeInTheDocument();
  });

  test("marks a received message unread and returns to the inbox", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(
      makeThread({
        messages: [makeMessage(3, "Send the savegame?")],
      }),
    );
    const markUnread = vi
      .spyOn(MessageService, "markUnread")
      .mockResolvedValue(undefined);

    renderThread();

    await userEvent.click(
      await screen.findByRole("link", { name: "Mark as unread" }),
    );

    expect(markUnread).toHaveBeenCalledWith(3);
  });

  test("does not offer marking own messages unread", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(
      makeThread({ messages: [makeMessage(4, "Here it is.")] }),
    );

    renderThread();

    expect(await screen.findByText("Here it is.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Mark as unread" }),
    ).not.toBeInTheDocument();
  });

  test("refreshes the unread indicator once the thread is read", async () => {
    vi.spyOn(MessageService, "getThread").mockResolvedValue(makeThread());
    const getCurrentUser = vi
      .spyOn(UserService, "getCurrentUser")
      .mockResolvedValue({ id: 1 } as UserDetails);

    renderThread();

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
  });
});
