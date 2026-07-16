import type { Config } from "src/services/ConfigService";
import { GenreNested } from "src/services/GenreService";
import type { ExternalLink } from "src/services/LevelService";
import { ExternalLinkType } from "src/services/LevelService";
import { TagNested } from "src/services/TagService";
import type { UserNested } from "src/services/UserService";
import { makeSentence } from "src/utils/string";
import { pluralize } from "src/utils/string";
import { validateMaxLength } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";
import { z } from "zod";

interface LevelFormValues {
  name: string;
  description: string;
  genres: GenreNested[];
  external_links: ExternalLink[];
  authors: UserNested[];
  tags: TagNested[];
  engine_id?: number;
  difficulty_id?: number;
  duration_id?: number;
  cover_id?: number;
  screenshot_ids: number[];
  file_id?: number;
}

const validateRange = <T>(
  value: T[],
  noun: string,
  minCount: number | null,
  maxCount: number | null,
): string | null => {
  if (minCount !== null && value.length < minCount) {
    return `At least ${minCount} ${pluralize(noun, minCount)} must be added`;
  }
  if (maxCount !== null && value.length > maxCount) {
    return `At most ${maxCount} ${pluralize(noun, maxCount)} can be added`;
  }
  return null;
};

// These arrays hold domain objects produced by the form's own picker
// components, so we only guard the basic shape (a non-null object) — z.object
// would strip fields the payload needs. Every real rule lives in the
// superRefine below, which reuses the shared validators.
const isObject = (value: unknown): boolean =>
  typeof value === "object" && value !== null;

// The limits come from the backend config; file is only required on create.
const buildSchema = (limits: Config["limits"], isEdit: boolean) =>
  z
    .object({
      name: z.string(),
      description: z.string(),
      genres: z.array(z.custom<GenreNested>(isObject)),
      external_links: z.array(z.custom<ExternalLink>(isObject)),
      authors: z.array(z.custom<UserNested>(isObject)),
      tags: z.array(z.custom<TagNested>(isObject)),
      engine_id: z.number().optional(),
      difficulty_id: z.number().optional(),
      duration_id: z.number().optional(),
      cover_id: z.number().optional(),
      screenshot_ids: z.array(z.number()),
      file_id: z.number().optional(),
    })
    .superRefine((values, ctx) => {
      // One error per field, first rule wins, mirroring the old resolver.
      const errored = new Set<string>();
      const fail = (field: keyof LevelFormValues, message: string | null) => {
        if (message && !errored.has(field)) {
          errored.add(field);
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: makeSentence(message),
          });
        }
      };

      const showcaseLinks = values.external_links.filter(
        (link) => link.link_type === ExternalLinkType.Showcase,
      );

      fail(
        "name",
        validateRequired(values.name) || validateMaxLength(100)(values.name),
      );
      fail(
        "genres",
        validateRange(
          values.genres,
          "genre",
          limits.min_genres,
          limits.max_genres,
        ),
      );
      fail(
        "external_links",
        validateRange(
          showcaseLinks,
          "YouTube link",
          limits.min_showcase_links,
          limits.max_showcase_links,
        ) ||
          validateRange(
            values.external_links.filter(
              (link) => link.link_type === ExternalLinkType.Main,
            ),
            "website link",
            0,
            1,
          ),
      );
      fail(
        "tags",
        validateRange(values.tags, "tag", limits.min_tags, limits.max_tags),
      );
      fail(
        "authors",
        validateRange(
          values.authors,
          "author",
          limits.min_authors,
          limits.max_authors,
        ),
      );
      const descriptionLimit = limits.markdown_fields.level_description ?? null;
      fail(
        "description",
        validateRequired(values.description) ||
          (descriptionLimit !== null
            ? validateMaxLength(descriptionLimit)(values.description)
            : null),
      );
      fail("engine_id", validateRequired(values.engine_id));
      fail("duration_id", validateRequired(values.duration_id));
      fail("difficulty_id", validateRequired(values.difficulty_id));
      fail("cover_id", validateRequired(values.cover_id));
      fail(
        "screenshot_ids",
        validateRange(
          values.screenshot_ids,
          "screenshot",
          limits.min_screenshots,
          limits.max_screenshots,
        ),
      );
      if (!isEdit) {
        fail("file_id", validateRequired(values.file_id));
      }

      // Special case: screenshots and showcase links share one media limit.
      const mediaError = validateRange(
        [...values.screenshot_ids, ...showcaseLinks],
        "media",
        limits.min_screenshots,
        limits.max_screenshots,
      );
      fail("screenshot_ids", mediaError);
      fail("external_links", mediaError);
    });

// Map the form values to the API payload: id arrays for the pickers and
// positioned external links.
const buildLevelPayload = (values: LevelFormValues) => ({
  name: values.name,
  description: values.description,
  engine_id: values.engine_id,
  duration_id: values.duration_id,
  difficulty_id: values.difficulty_id,
  genre_ids: values.genres.map((genre) => genre.id),
  external_links: values.external_links.map((link, i) => ({
    ...link,
    position: i,
  })),
  author_ids: values.authors.map((author) => author.id),
  tag_ids: values.tags.map((tag) => tag.id),
  cover_id: values.cover_id,
  screenshot_ids: values.screenshot_ids,
  file_id: values.file_id,
});

export type { LevelFormValues };
export { buildSchema, buildLevelPayload };
