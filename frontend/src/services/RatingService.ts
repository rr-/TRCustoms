import {
  levelsRatingStatsRetrieve,
  ratingsCreate,
  ratingsDestroy,
  ratingsList,
  ratingsPartialUpdate,
  ratingsRetrieve,
} from "src/client";
import type {
  LevelRatingStats as RatingStats,
  RatingDetails,
  RatingListing,
} from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

enum RatingType {
  TRLE = "le",
  TRC = "mo",
}

interface RatingSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | undefined;
  authors?: Array<number> | undefined;
}

interface RatingSearchResult
  extends GenericSearchResult<RatingSearchQuery, RatingListing> {}

interface RatingBaseChangePayload {
  levelId: number;
  answerIds: number[];
}

interface RatingUpdatePayload extends RatingBaseChangePayload {}
interface RatingCreatePayload extends RatingBaseChangePayload {}

const searchRatings = async (
  searchQuery: RatingSearchQuery,
): Promise<RatingSearchResult> => {
  const query: { [key: string]: any } = {
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || undefined,
    authors: searchQuery.authors?.join(",") || undefined,
  };
  const { data } = await ratingsList({ query, throwOnError: true });
  return { ...data, searchQuery };
};

const getRatingById = async (ratingId: number): Promise<RatingDetails> => {
  const { data } = await ratingsRetrieve({
    path: { id: ratingId },
    throwOnError: true,
  });
  return data;
};

const getRatingByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number | undefined,
): Promise<RatingDetails | null> => {
  if (authorId === undefined) {
    return null;
  }
  const ratings = await searchRatings({
    authors: [authorId],
    levels: [levelId],
  });
  if (ratings.results.length) {
    return await getRatingById(ratings.results[0].id);
  }
  return null;
};

const update = async (
  ratingId: number,
  payload: RatingUpdatePayload,
): Promise<RatingDetails> => {
  const { data } = await ratingsPartialUpdate({
    path: { id: ratingId },
    body: { level_id: payload.levelId, answer_ids: payload.answerIds } as any,
    throwOnError: true,
  });
  return data;
};

const create = async (payload: RatingCreatePayload): Promise<RatingDetails> => {
  const { data } = await ratingsCreate({
    body: { level_id: payload.levelId, answer_ids: payload.answerIds } as any,
    throwOnError: true,
  });
  return data;
};

const deleteRating = async (ratingId: number): Promise<void> => {
  await ratingsDestroy({ path: { id: ratingId }, throwOnError: true });
};

const getRatingStatsByLevelId = async (
  levelId: number,
): Promise<RatingStats> => {
  const { data } = await levelsRatingStatsRetrieve({
    path: { id: levelId },
    throwOnError: true,
  });
  return data;
};

const RatingService = {
  searchRatings,
  getRatingById,
  getRatingByAuthorAndLevelIds,
  create,
  update,
  delete: deleteRating,
  getRatingStatsByLevelId,
};

export type {
  RatingDetails,
  RatingListing,
  RatingSearchQuery,
  RatingSearchResult,
  RatingStats,
};

export { RatingType, RatingService };
