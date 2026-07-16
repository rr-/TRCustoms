import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { ReviewForm } from "src/components/forms/ReviewForm";
import { ReviewService } from "src/services/ReviewService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const level = { id: 99, name: "Test Level" } as any;
const createdReview = { id: 12, level } as any;

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

const renderForm = () => render(<ReviewForm level={level} />, { wrapper });

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders a submit button for a new review", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Submit review" }),
    ).toBeInTheDocument();
  });

  test("shows a per-field error and does not submit when empty", async () => {
    const create = vi.spyOn(ReviewService, "create");
    renderForm();

    await userEvent.click(
      screen.getByRole("button", { name: "Submit review" }),
    );

    expect(
      await screen.findByText("Review text is required"),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test("submits the text with the level id", async () => {
    const create = vi
      .spyOn(ReviewService, "create")
      .mockResolvedValue(createdReview);
    renderForm();

    await userEvent.type(screen.getByLabelText(/Review text/), "Great level!");
    await userEvent.click(
      screen.getByRole("button", { name: "Submit review" }),
    );

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        levelId: 99,
        text: "Great level!",
      }),
    );
    expect(await screen.findByText("Click here")).toBeInTheDocument();
  });

  test("maps a server field error onto the field", async () => {
    vi.spyOn(ReviewService, "create").mockRejectedValue({
      text: ["No profanity please"],
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderForm();

    await userEvent.type(screen.getByLabelText(/Review text/), "bad words");
    await userEvent.click(
      screen.getByRole("button", { name: "Submit review" }),
    );

    expect(await screen.findByText("No profanity please")).toBeInTheDocument();
  });
});
