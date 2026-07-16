import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { RatingForm } from "src/components/forms/RatingForm";
import { RatingService } from "src/services/RatingService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const level = { id: 99, name: "Test Level" } as any;

const question = (id: number, category: string, text: string) => ({
  id,
  category,
  position: 0,
  question_text: text,
  answers: [
    { id: id * 10 + 1, answer_text: "Yes", position: 0 },
    { id: id * 10 + 2, answer_text: "No", position: 1 },
  ],
});

const singleStepConfig = {
  rating_questions: [question(1, "gameplay", "Was it fun?")],
} as any;

const twoStepConfig = {
  rating_questions: [
    question(1, "gameplay", "Was it fun?"),
    question(2, "atmosphere", "Was it pretty?"),
  ],
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

const renderForm = (config = singleStepConfig, rating?: any) =>
  render(<RatingForm config={config} level={level} rating={rating} />, {
    wrapper,
  });

describe("RatingForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("shows Submit on the only step of a single-step questionnaire", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });

  test("requires an answer before submitting", async () => {
    const create = vi.spyOn(RatingService, "create");
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Please select an answer"),
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test("submits the selected answer ids with the level id", async () => {
    const create = vi
      .spyOn(RatingService, "create")
      .mockResolvedValue({ id: 5, level } as any);
    renderForm();

    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({ levelId: 99, answerIds: [11] }),
    );
    expect(await screen.findByText("Click here")).toBeInTheDocument();
  });

  test("blocks step navigation until the step is answered", async () => {
    renderForm(twoStepConfig);

    // First step: Next, not Submit.
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit" }),
    ).not.toBeInTheDocument();

    // Cannot advance without answering.
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(
      await screen.findByText("Please select an answer"),
    ).toBeInTheDocument();
    expect(screen.getByText("Was it fun?", { exact: false })).toBeVisible();

    // Answer, then advance to the final step which now offers Submit.
    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      await screen.findByText("Was it pretty?", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  test("maps a server error onto a banner", async () => {
    vi.spyOn(RatingService, "create").mockRejectedValue({
      answer_ids: ["Invalid answer selection"],
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderForm();

    await userEvent.click(screen.getByLabelText("Yes"));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Invalid answer selection"),
    ).toBeInTheDocument();
  });
});
