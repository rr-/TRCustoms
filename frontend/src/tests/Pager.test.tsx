import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Pager } from "src/components/common/Pager";
import type { PagedResponse } from "src/types";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const renderPager = (onPageChange = vi.fn()) => {
  render(
    <MemoryRouter>
      <Pager
        onPageChange={onPageChange}
        pagedResponse={
          { current_page: 3, last_page: 10 } as unknown as PagedResponse<never>
        }
      />
    </MemoryRouter>,
  );
  return onPageChange;
};

describe("Pager", () => {
  test("labels the previous/next controls", () => {
    renderPager();
    expect(screen.getByLabelText("First page")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    expect(screen.getByLabelText("Last page")).toBeInTheDocument();
  });

  test("marks the current page with aria-current", () => {
    renderPager();
    const current = screen.getByRole("link", { current: "page" });
    expect(current).toHaveTextContent("3");
  });

  test("changes page when a control is clicked", async () => {
    const onPageChange = renderPager();
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
