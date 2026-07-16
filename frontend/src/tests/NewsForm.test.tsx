import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { NewsForm } from "src/components/common/NewsForm";
import { NewsService } from "src/services/NewsService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const createdNews = { id: 3, subject: "Big news" } as any;

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

const renderForm = () => render(<NewsForm />, { wrapper });

describe("NewsForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders a submit button for new news", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Submit news" }),
    ).toBeInTheDocument();
  });

  test("shows per-field errors and does not submit when empty", async () => {
    const create = vi.spyOn(NewsService, "create");
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Submit news" }));

    expect(await screen.findByText("Subject is required")).toBeInTheDocument();
    expect(screen.getByText("News text is required")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test("submits the subject and text", async () => {
    const create = vi
      .spyOn(NewsService, "create")
      .mockResolvedValue(createdNews);
    renderForm();

    await userEvent.type(screen.getByLabelText(/Subject/), "Big news");
    await userEvent.type(screen.getByLabelText(/News text/), "The details");
    await userEvent.click(screen.getByRole("button", { name: "Submit news" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        subject: "Big news",
        text: "The details",
      }),
    );
    expect(await screen.findByText("Click here")).toBeInTheDocument();
  });

  test("maps a server field error onto the subject field", async () => {
    vi.spyOn(NewsService, "create").mockRejectedValue({
      subject: ["Subject already used"],
    });
    renderForm();

    await userEvent.type(screen.getByLabelText(/Subject/), "Dupe");
    await userEvent.type(screen.getByLabelText(/News text/), "Body");
    await userEvent.click(screen.getByRole("button", { name: "Submit news" }));

    expect(await screen.findByText("Subject already used")).toBeInTheDocument();
  });
});
