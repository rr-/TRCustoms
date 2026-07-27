import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ReviewVoteControls } from "src/components/common/ReviewsList/ReviewVoteControls";
import type { ReviewListing, ReviewVoter } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const makeVoter = (username: string, vote: -1 | 1): ReviewVoter =>
  ({
    user: { id: username.length, username, picture: null },
    vote,
    created: "2026-01-01T00:00:00Z",
  }) as unknown as ReviewVoter;

const review = {
  id: 42,
  upvote_count: 2,
  downvote_count: 1,
  current_user_vote: null,
  can_vote: true,
} as unknown as ReviewListing;

const renderControls = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <ReviewVoteControls review={review} onVote={vi.fn()} />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("ReviewVoteControls", () => {
  beforeEach(() => {
    vi.spyOn(ReviewService, "getVoters").mockResolvedValue([
      makeVoter("alice", 1),
      makeVoter("bob", 1),
      makeVoter("carol", -1),
    ]);
  });

  test("shows the upvoters when the upvote count is clicked", async () => {
    renderControls();

    await userEvent.click(screen.getByLabelText("Show who cast an upvote"));

    expect(await screen.findByText(/Upvoted by/)).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("carol")).not.toBeInTheDocument();
  });

  test("shows the downvoters when the downvote count is clicked", async () => {
    renderControls();

    await userEvent.click(screen.getByLabelText("Show who cast a downvote"));

    expect(await screen.findByText(/Downvoted by/)).toBeInTheDocument();
    expect(screen.getByText("carol")).toBeInTheDocument();
    expect(screen.queryByText("alice")).not.toBeInTheDocument();
  });

  test("closes the popup when the same count is clicked again", async () => {
    renderControls();
    const trigger = screen.getByLabelText("Show who cast an upvote");

    await userEvent.click(trigger);
    expect(await screen.findByText(/Upvoted by/)).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText(/Upvoted by/)).not.toBeInTheDocument();
  });

  test("closes the popup when clicking outside of it", async () => {
    renderControls();

    await userEvent.click(screen.getByLabelText("Show who cast an upvote"));
    expect(await screen.findByText(/Upvoted by/)).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByText(/Upvoted by/)).not.toBeInTheDocument();
  });

  test("does not offer the popup when nobody voted", () => {
    vi.spyOn(ReviewService, "getVoters").mockResolvedValue([]);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ReviewVoteControls
            review={{ ...review, upvote_count: 0 }}
            onVote={vi.fn()}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText("Show who cast an upvote")).toBeDisabled();
  });
});
