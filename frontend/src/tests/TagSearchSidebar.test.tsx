import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TagSearchSidebar } from "src/components/common/TagSearchSidebar";
import type { TagSearchQuery } from "src/services/TagService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const defaultSearchQuery: TagSearchQuery = {
  page: null,
  sort: null,
  search: null,
};

describe("TagSearchSidebar", () => {
  let onSearchQueryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearchQueryChange = vi.fn();
  });

  const renderSidebar = () =>
    render(
      <MemoryRouter>
        <TagSearchSidebar
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={defaultSearchQuery}
          onSearchQueryChange={
            onSearchQueryChange as (searchQuery: TagSearchQuery) => void
          }
        />
      </MemoryRouter>,
    );

  test("submits the typed search term", async () => {
    renderSidebar();

    await userEvent.type(screen.getByLabelText(/Tag name/), "flip");
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "flip", page: null }),
      ),
    );
  });

  test("reset restores the default query", async () => {
    renderSidebar();

    await userEvent.click(screen.getByText("(reset)"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(defaultSearchQuery);
  });
});
