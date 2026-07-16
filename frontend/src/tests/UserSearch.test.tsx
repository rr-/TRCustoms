import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { UserSearch } from "src/components/common/UserSearch";
import type { UserSearchQuery } from "src/services/UserService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const defaultSearchQuery: UserSearchQuery = {
  page: null,
  sort: null,
  search: null,
  hideInactiveReviewers: false,
};

describe("UserSearch", () => {
  let onSearchQueryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearchQueryChange = vi.fn();
  });

  const renderSearch = (showCheckbox = false) =>
    render(
      <MemoryRouter>
        <UserSearch
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={defaultSearchQuery}
          onSearchQueryChange={
            onSearchQueryChange as (searchQuery: UserSearchQuery) => void
          }
          showInactiveReviewersCheckbox={showCheckbox}
        />
      </MemoryRouter>,
    );

  test("submits the search term", async () => {
    renderSearch();

    await userEvent.type(screen.getByLabelText(/Search/), "alice");
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "alice", page: null }),
      ),
    );
  });

  test("reset restores the default query", async () => {
    renderSearch();

    await userEvent.click(screen.getByText("Reset"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(defaultSearchQuery);
  });

  test("toggling the checkbox submits with the flag", async () => {
    renderSearch(true);

    await userEvent.click(screen.getByRole("checkbox"));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ hideInactiveReviewers: true }),
      ),
    );
  });
});
