import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { LevelSearchSidebar } from "src/components/common/LevelSearchSidebar";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const defaultSearchQuery = {
  page: null,
  sort: "-created",
  search: null,
} as any;

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("LevelSearchSidebar", () => {
  let onSearchQueryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearchQueryChange = vi.fn();
  });

  const renderSidebar = () =>
    render(
      <LevelSearchSidebar
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={defaultSearchQuery}
        onSearchQueryChange={onSearchQueryChange as any}
      />,
      { wrapper },
    );

  test("submits the typed search term", async () => {
    renderSidebar();

    await userEvent.type(screen.getByLabelText(/Search/), "cavern");
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "cavern", page: null }),
      ),
    );
  });

  test("changing the sort submits immediately", async () => {
    renderSidebar();

    await userEvent.selectOptions(screen.getByLabelText(/Sort/), "-rating");

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ sort: "-rating" }),
      ),
    );
  });

  test("reset restores the default query", async () => {
    renderSidebar();

    await userEvent.click(screen.getByText("(reset)"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(defaultSearchQuery);
  });
});
