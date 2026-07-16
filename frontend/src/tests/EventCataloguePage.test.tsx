import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { EventCataloguePage } from "src/components/pages/EventCataloguePage";
import { EventService } from "src/services/EventService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const emptyResult = {
  current_page: 1,
  last_page: 1,
  total_count: 0,
  next: null,
  previous: null,
  results: [],
} as any;

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/extras/events"]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("EventCataloguePage search", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("submits the entered search term", async () => {
    const search = vi
      .spyOn(EventService, "searchEvents")
      .mockResolvedValue(emptyResult);
    render(<EventCataloguePage />, { wrapper });

    await userEvent.type(
      screen.getByPlaceholderText("Search events..."),
      "trle",
    );
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith(
        expect.objectContaining({ search: "trle", year: undefined }),
      ),
    );
  });

  test("submits the selected year as a number", async () => {
    const search = vi
      .spyOn(EventService, "searchEvents")
      .mockResolvedValue(emptyResult);
    render(<EventCataloguePage />, { wrapper });

    await userEvent.selectOptions(screen.getByRole("combobox"), "2015");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2015 }),
      ),
    );
  });
});
