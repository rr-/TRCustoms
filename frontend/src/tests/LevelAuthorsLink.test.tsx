import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LevelAuthorsLink } from "src/components/links/LevelAuthorsLink";
import type { UserNested } from "src/services/UserService";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

const makeAuthors = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => ({ id: i + 1, username: `author${i + 1}` }) as UserNested,
  );

const renderAuthors = (authors: UserNested[]) =>
  render(
    <MemoryRouter>
      <LevelAuthorsLink authors={authors} />
    </MemoryRouter>,
  );

describe("LevelAuthorsLink", () => {
  test("shows a placeholder when there are no authors", () => {
    const { container } = renderAuthors([]);
    expect(container).toHaveTextContent("Unknown");
  });

  test("lists up to three authors by name", () => {
    const { container } = renderAuthors(makeAuthors(3));
    expect(container).toHaveTextContent("author1, author2, author3");
    expect(screen.queryByText("Multiple authors")).not.toBeInTheDocument();
  });

  test("collapses more than three authors", () => {
    renderAuthors(makeAuthors(4));
    expect(screen.getByText("Multiple authors")).toHaveAttribute(
      "title",
      "author1, author2, author3, author4",
    );
  });
});
