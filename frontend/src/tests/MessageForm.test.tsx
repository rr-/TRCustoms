import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { MessageForm } from "src/components/forms/MessageForm";
import { MessageService } from "src/services/MessageService";
import type { UserDetails } from "src/services/UserService";
import { defaultConfig } from "src/stores/config";
import { useConfig } from "src/stores/config";
import { useUser } from "src/stores/user";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const receiver = {
  id: 2,
  username: "receiver",
  can_message: true,
} as unknown as UserDetails;

const setUser = (permissions: string[]) =>
  useUser.setState({
    user: { id: 1, username: "sender", permissions } as unknown as UserDetails,
  });

describe("MessageForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useConfig.setState({
      config: {
        ...defaultConfig,
        limits: {
          ...defaultConfig.limits,
          markdown_fields: {
            ...defaultConfig.limits.markdown_fields,
            message_text: 1000,
          },
        },
      },
    });
    vi.spyOn(MessageService, "getQuota").mockResolvedValue({
      limit: 5,
      used: 1,
      remaining: 4,
    });
  });

  test("starts a conversation and shows the daily limit", async () => {
    setUser([]);
    const thread = { id: 9 } as Awaited<ReturnType<typeof MessageService.send>>;
    const send = vi.spyOn(MessageService, "send").mockResolvedValue(thread);
    const onSubmit = vi.fn();
    render(<MessageForm receiver={receiver} onSubmit={onSubmit} />, {
      wrapper,
    });

    expect(
      await screen.findByText("New conversations today: 4/5 remaining"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Administration/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Message/), "hello there");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(send).toHaveBeenCalledWith({
      receiverId: 2,
      text: "hello there",
      sendAsAdministrator: false,
    });
    expect(onSubmit).toHaveBeenCalledWith(thread);
  });

  test("lets moderators send as Administration", async () => {
    setUser(["message_as_administrator"]);
    render(<MessageForm receiver={receiver} />, { wrapper });

    expect(
      screen.getByLabelText('Send as "Administration"'),
    ).toBeInTheDocument();
  });

  test("rejects messages over the length limit", async () => {
    setUser([]);
    const send = vi.spyOn(MessageService, "send");
    render(<MessageForm receiver={receiver} />, { wrapper });

    await userEvent.click(screen.getByLabelText(/Message/));
    await userEvent.paste("x".repeat(1001));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText(/at most 1000 characters/),
    ).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();
  });
});
