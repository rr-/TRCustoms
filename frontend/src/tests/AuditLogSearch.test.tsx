import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuditLogSearch } from "src/components/common/AuditLogSearch";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const defaultSearchQuery: AuditLogSearchQuery = {
  page: null,
  sort: null,
  search: null,
  userSearch: undefined,
  objectSearch: undefined,
  isActionRequired: null,
};

describe("AuditLogSearch", () => {
  let onSearchQueryChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearchQueryChange = vi.fn();
  });

  const renderSearch = () =>
    render(
      <MemoryRouter>
        <AuditLogSearch
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={defaultSearchQuery}
          onSearchQueryChange={
            onSearchQueryChange as (searchQuery: AuditLogSearchQuery) => void
          }
        />
      </MemoryRouter>,
    );

  test("submits the user and object search terms", async () => {
    renderSearch();

    await userEvent.type(screen.getByLabelText(/Search user/), "alice");
    await userEvent.type(screen.getByLabelText(/Search object/), "level");
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));

    await waitFor(() =>
      expect(onSearchQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({ userSearch: "alice", objectSearch: "level" }),
      ),
    );
  });

  test("reset restores the default query", async () => {
    renderSearch();

    await userEvent.click(screen.getByText("(reset)"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(defaultSearchQuery);
  });

  test("a state checkbox edits the search string directly", async () => {
    renderSearch();

    await userEvent.click(screen.getByLabelText("Banned"));

    expect(onSearchQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "user:banned" }),
    );
  });
});
