import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { WalkthroughForm } from "src/components/common/WalkthroughForm";
import { WalkthroughService } from "src/services/WalkthroughService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const fakeLevel = { id: 42, name: "The Great Pyramid" } as any;
const createdWalkthrough = {
  id: 7,
  level: { id: 42, name: "The Great Pyramid" },
} as any;

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

const renderForm = () =>
  render(<WalkthroughForm level={fakeLevel} />, { wrapper });

describe("WalkthroughForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders a submit button for a new walkthrough", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Save draft" }),
    ).toBeInTheDocument();
  });

  test("shows a per-field error and does not submit when the text is empty", async () => {
    const create = vi.spyOn(WalkthroughService, "create");
    renderForm();

    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(
      await screen.findByText("Walkthrough text is required"),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test("submits the text and shows the success message", async () => {
    const create = vi
      .spyOn(WalkthroughService, "create")
      .mockResolvedValue(createdWalkthrough);
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0][0]).toMatchObject({
      levelId: 42,
      text: expect.stringContaining("Level Walkthrough"),
    });
    expect(await screen.findByText(/draft saved/i)).toBeInTheDocument();
  });

  test("maps a server field error onto the field", async () => {
    vi.spyOn(WalkthroughService, "create").mockRejectedValue({
      text: ["Server rejected this text"],
    });
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(
      await screen.findByText("Server rejected this text"),
    ).toBeInTheDocument();
  });
});
