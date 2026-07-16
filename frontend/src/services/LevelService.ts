import {
  levelsApproveCreate,
  levelsCreate,
  levelsDestroy,
  levelsList,
  levelsPartialUpdate,
  levelsRatingStatsRetrieve,
  levelsRejectCreate,
  levelsRetrieve,
} from "src/client";
import type {
  LevelDetails,
  LevelDetailsWritable,
  LevelRatingStats,
  LevelDifficultyNested as LevelDifficulty,
  LevelDurationNested as LevelDuration,
  LevelExternalLink as ExternalLink,
  LevelFile,
  LevelListing,
  LevelNested,
  LevelScreenshot as Screenshot,
  LinkTypeEnum,
} from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import {
  boolToSearchString,
  filterFalsyObjectValues,
  getGenericSearchQuery,
} from "src/utils/misc";

enum ExternalLinkType {
  Showcase = "sh",
  Main = "ma",
}

enum LevelPlaylistFinishedLevelFilter {
  ShowAll = "show_all",
  Hide = "hide",
  Unrated = "unrated",
  Unreviewed = "unreviewed",
}

enum LevelPlaylistDroppedLevelFilter {
  ShowAll = "show_all",
  Hide = "hide",
}

interface ScreenshotList extends Array<Screenshot> {}

interface LevelSearchQuery extends GenericSearchQuery {
  tags?: number[];
  genres?: number[];
  engines?: number[];
  authors?: number[];
  difficulties?: number[];
  durations?: number[];
  ratings?: number[];
  isApproved?: boolean | null;
  reviewsMax?: number | undefined | null;
  date?: string;
  videoWalkthroughs?: boolean | null;
  textWalkthroughs?: boolean | null;
  playlistFinishedLevels?: LevelPlaylistFinishedLevelFilter | null;
  playlistDroppedLevels?: LevelPlaylistDroppedLevelFilter | null;
}

interface LevelSearchResult
  extends GenericSearchResult<LevelSearchQuery, LevelListing> {}

const searchLevels = async (
  searchQuery: LevelSearchQuery,
): Promise<LevelSearchResult> => {
  const query: Record<string, string | number | null | undefined> =
    filterFalsyObjectValues({
      ...getGenericSearchQuery(searchQuery),
      tags: searchQuery.tags?.join(","),
      genres: searchQuery.genres?.join(","),
      engines: searchQuery.engines?.join(","),
      authors: searchQuery.authors?.join(","),
      difficulties: searchQuery.difficulties?.join(","),
      durations: searchQuery.durations?.join(","),
      ratings: searchQuery.ratings?.join(","),
      is_approved: boolToSearchString(searchQuery.isApproved),
      reviews_max: searchQuery.reviewsMax,
      date: searchQuery.date,
      video_walkthroughs: boolToSearchString(searchQuery.videoWalkthroughs),
      text_walkthroughs: boolToSearchString(searchQuery.textWalkthroughs),
      finished_levels:
        searchQuery.playlistFinishedLevels ===
        LevelPlaylistFinishedLevelFilter.ShowAll
          ? null
          : searchQuery.playlistFinishedLevels,
      dropped_levels:
        searchQuery.playlistDroppedLevels ===
        LevelPlaylistDroppedLevelFilter.ShowAll
          ? null
          : searchQuery.playlistDroppedLevels,
    });
  const { data } = await levelsList({ query, throwOnError: true });
  return { ...data, searchQuery };
};

const getLevelById = async (levelId: number): Promise<LevelDetails> => {
  const { data } = await levelsRetrieve({
    path: { id: levelId },
    throwOnError: true,
  });
  return data;
};

const getRatingStats = async (levelId: number): Promise<LevelRatingStats> => {
  const { data } = await levelsRatingStatsRetrieve({
    path: { id: levelId },
    throwOnError: true,
  });
  return data;
};

// Derived from the generated writable type so a new writable field can't be
// silently dropped: the old hand-written list omitted external_links and
// trle_id. Optional throughout — update sends a subset, and create asserts the
// full writable shape because the form's zod schema guarantees the required
// fields are present at runtime.
type LevelChangePayload = Partial<LevelDetailsWritable>;

const update = async (
  levelId: number,
  payload: LevelChangePayload,
): Promise<LevelDetails> => {
  const { data } = await levelsPartialUpdate({
    path: { id: levelId },
    body: filterFalsyObjectValues({ ...payload }),
    throwOnError: true,
  });
  return data;
};

const create = async (payload: LevelChangePayload): Promise<LevelDetails> => {
  const { data } = await levelsCreate({
    // The payload type keeps every field optional (it is shared with the PATCH
    // path), but the form's zod schema guarantees the required ones are present
    // for a create, so assert the writable shape rather than widening to any.
    // Undefined optionals drop out during JSON serialization.
    body: { ...payload } as LevelDetailsWritable,
    throwOnError: true,
  });
  return data;
};

const approve = async (levelId: number): Promise<void> => {
  await levelsApproveCreate({ path: { id: levelId }, throwOnError: true });
};

const reject = async (levelId: number, reason: string): Promise<void> => {
  await levelsRejectCreate({
    path: { id: levelId },
    body: { reason },
    throwOnError: true,
  });
};

const deleteLevel = async (levelId: number): Promise<void> => {
  await levelsDestroy({ path: { id: levelId }, throwOnError: true });
};

const LevelService = {
  searchLevels,
  getLevelById,
  getRatingStats,
  update,
  create,
  approve,
  reject,
  delete: deleteLevel,
};

const formatLinkType = (linkType: LinkTypeEnum): string => {
  switch (linkType) {
    case "sh":
      return "YouTube";
    case "ma":
      return "Website";
  }
};

const getLevelOwningUserIds = (level: LevelListing): number[] => {
  const ret = [...level.authors.map((author) => author.id)];
  if (level.uploader?.id) {
    ret.push(level.uploader.id);
  }
  return ret;
};

export type {
  ExternalLink,
  LevelDetails,
  LevelDifficulty,
  LevelDuration,
  LevelFile,
  LevelListing,
  LevelNested,
  LevelSearchQuery,
  LevelSearchResult,
  Screenshot,
  ScreenshotList,
};

export {
  ExternalLinkType,
  LevelPlaylistDroppedLevelFilter,
  LevelPlaylistFinishedLevelFilter,
  LevelService,
  formatLinkType,
  getLevelOwningUserIds,
};
