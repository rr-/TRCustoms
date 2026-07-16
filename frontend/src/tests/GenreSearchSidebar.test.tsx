import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { GenreSearchSidebar } from "src/components/common/GenreSearchSidebar";
import type { GenreSearchQuery } from "src/services/GenreService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const defaultSearchQuery: GenreSearchQuery = {
  page: null,
  sort: null,
  search: null,
};

describe("GenreSearchSidebar", () => {
  let onSearchQueryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearchQueryChange = vi.fn();
  });

  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <GenreSearchSidebar
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={defaultSearchQuery}
          onSearchQueryChange={
            onSearchQueryChange as (searchQuery: GenreSearchQuery) => void
          }
        />
      </MemoryRouter>,
    );

  test("submits the typed search term", async () => {
    renderSidebar();

    await userEvent.type(screen.getByLabelText(/Genre name/), "puzzle");
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "puzzle", page: null }),
      ),
    );
  });

  test("reset restores the default query", async () => {
    renderSidebar();

    await userEvent.click(screen.getByText("(reset)"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(defaultSearchQuery);
  });
});
