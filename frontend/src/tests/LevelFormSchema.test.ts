import assert from "node:assert/strict";
import type { UseFormReturn } from "react-hook-form";
import {
  buildLevelPayload,
  buildSchema,
} from "src/components/forms/LevelForm/schema";
import type { LevelFormValues } from "src/components/forms/LevelForm/schema";
import { applyLevelServerErrors } from "src/components/forms/LevelForm/serverErrors";
import type { Config } from "src/services/ConfigService";
import { test } from "vitest";

const limits: Config["limits"] = {
  markdown_fields: {
    review_text: null,
    level_description: null,
    user_bio: null,
    news_text: null,
    walkthrough_text: null,
  },
  min_tags: 0,
  max_tags: 10,
  min_genres: 1,
  max_genres: 5,
  min_screenshots: 1,
  max_screenshots: 9,
  min_showcase_links: 0,
  max_showcase_links: 2,
  min_authors: 1,
  max_authors: 25,
  max_tag_length: 20,
};

const validValues = {
  name: "My Level",
  description: "A description",
  genres: [{ id: 1 }],
  external_links: [],
  authors: [{ id: 1 }],
  tags: [],
  engine_id: 1,
  difficulty_id: 1,
  duration_id: 1,
  cover_id: 1,
  screenshot_ids: [10],
  file_id: 5,
} as unknown as LevelFormValues;

const erroredPaths = (values: unknown, isEdit = false): unknown[] => {
  const result = buildSchema(limits, isEdit).safeParse(values);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path[0]);
};

test("schema accepts valid values", () => {
  assert.equal(buildSchema(limits, false).safeParse(validValues).success, true);
});

test("schema flags a missing name", () => {
  assert.ok(erroredPaths({ ...validValues, name: "" }).includes("name"));
});

test("schema flags too few genres", () => {
  assert.ok(erroredPaths({ ...validValues, genres: [] }).includes("genres"));
});

test("file is required on create but optional on edit", () => {
  const noFile = { ...validValues, file_id: undefined };
  assert.ok(erroredPaths(noFile, false).includes("file_id"));
  assert.equal(buildSchema(limits, true).safeParse(noFile).success, true);
});

test("buildLevelPayload maps pickers to ids and positions links", () => {
  const payload = buildLevelPayload({
    ...validValues,
    genres: [{ id: 3 }, { id: 7 }],
    external_links: [{ url: "x", link_type: "sh" }],
  } as unknown as LevelFormValues);

  assert.deepEqual(payload.genre_ids, [3, 7]);
  assert.equal(payload.external_links[0].position, 0);
});

test("applyLevelServerErrors maps backend field names to the form", () => {
  const calls: string[] = [];
  const form = {
    setError: (field: string) => calls.push(field),
  } as unknown as UseFormReturn<LevelFormValues>;

  const applied = applyLevelServerErrors(form, {
    genre_ids: ["Pick at least one genre"],
    name: ["This field is required"],
  });

  assert.equal(applied, true);
  assert.ok(calls.includes("genres"));
  assert.ok(calls.includes("name"));
});
