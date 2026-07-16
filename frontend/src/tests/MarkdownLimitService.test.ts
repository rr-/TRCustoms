import type { Config } from "../services/ConfigService";
import {
  COUNTER_VISIBILITY_THRESHOLD,
  getMarkdownLimit,
  getMarkdownLimitState,
} from "../services/MarkdownLimitService";
import assert from "node:assert/strict";
import { test } from "vitest";

const config: Config = {
  countries: [],
  tags: [],
  genres: [],
  engines: [],
  durations: [],
  difficulties: [],
  rating_questions: [],
  limits: {
    markdown_fields: {
      review_text: 5000,
      level_description: 5000,
      user_bio: 5000,
      news_text: null,
      walkthrough_text: null,
    },
    min_tags: 0,
    max_tags: 0,
    min_genres: 0,
    max_genres: 0,
    min_screenshots: 0,
    max_screenshots: 0,
    min_showcase_links: 0,
    max_showcase_links: 0,
    min_authors: 0,
    max_authors: 0,
    max_tag_length: 0,
  },
  stats: {
    total_levels: 0,
    total_ratings: 0,
    total_reviews: 0,
    total_downloads: 0,
    total_walkthroughs: 0,
    ratings: [],
    walkthroughs: {
      video_and_text: 0,
      video: 0,
      text: 0,
      none: 0,
    },
  },
  global_message: null,
};

test("getMarkdownLimit returns the configured value for a capped field", () => {
  assert.equal(getMarkdownLimit(config, "review_text"), 5000);
});

test("getMarkdownLimit returns null for an uncapped field", () => {
  assert.equal(getMarkdownLimit(config, "news_text"), null);
});

test("getMarkdownLimitState hides the counter below the visibility threshold", () => {
  const limit = 100;
  const text = "x".repeat(Math.floor(limit * COUNTER_VISIBILITY_THRESHOLD) - 1);
  const state = getMarkdownLimitState(text, limit);

  assert.equal(state?.shouldDisplay, false);
});

test("getMarkdownLimitState shows the counter at the visibility threshold", () => {
  const limit = 100;
  const text = "x".repeat(limit * COUNTER_VISIBILITY_THRESHOLD);
  const state = getMarkdownLimitState(text, limit);

  assert.equal(state?.shouldDisplay, true);
  assert.equal(state?.currentLength, 75);
});

test("getMarkdownLimitState keeps showing the counter when over limit", () => {
  const state = getMarkdownLimitState("x".repeat(101), 100);

  assert.equal(state?.shouldDisplay, true);
  assert.equal(state?.isOverLimit, true);
  assert.equal(state?.currentLength, 101);
  assert.equal(state?.limit, 100);
});

test("getMarkdownLimitState returns null for uncapped fields", () => {
  assert.equal(getMarkdownLimitState("anything", null), null);
});
