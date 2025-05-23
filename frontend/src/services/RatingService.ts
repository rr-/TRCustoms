import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { LevelNested } from "src/services/LevelService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import type { RatingClass } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";

interface RatingAuthor extends UserNested {
  rated_level_count: number;
}

interface CategoryRatingStats {
  category: string;
  total_points: number;
  min_points: number;
  max_points: number;
}

interface RatingStats {
  trc_rating_count: number;
  trle_rating_count: number;
  categories: CategoryRatingStats[];
}

enum RatingType {
  TRLE = "le",
  TRC = "mo",
}

interface RatingListing {
  level: LevelNested;
  id: number;
  author: RatingAuthor;
  rating_class: RatingClass | null;
  created: string;
  rating_type: RatingType;
  last_updated: string;
  last_user_content_updated: string;
}

interface RatingDetails extends RatingListing {
  answers: number[];
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
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || null,
    authors: searchQuery.authors?.join(",") || null,
  });
  const response = (await api.get(`${API_URL}/ratings/`, {
    params,
  })) as AxiosResponse<RatingSearchResult>;
  return { ...response.data, searchQuery };
};

const getRatingById = async (ratingId: number): Promise<RatingDetails> => {
  const response = (await api.get(
    `${API_URL}/ratings/${ratingId}/`,
  )) as AxiosResponse<RatingDetails>;
  return response.data;
};

const getRatingByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number,
): Promise<RatingDetails | null> => {
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
  const data = {
    level_id: payload.levelId,
    answer_ids: payload.answerIds,
  };
  const response = (await api.patch(
    `${API_URL}/ratings/${ratingId}/`,
    data,
  )) as AxiosResponse<RatingDetails>;
  return response.data;
};

const create = async (payload: RatingCreatePayload): Promise<RatingDetails> => {
  const data = {
    level_id: payload.levelId,
    answer_ids: payload.answerIds,
  };
  const response = (await api.post(
    `${API_URL}/ratings/`,
    data,
  )) as AxiosResponse<RatingDetails>;
  return response.data;
};

const deleteRating = async (ratingId: number): Promise<void> => {
  await api.delete(`${API_URL}/ratings/${ratingId}/`);
};

const getRatingStatsByLevelId = async (
  levelId: number,
): Promise<RatingStats> => {
  const response = (await api.get(
    `${API_URL}/levels/${levelId}/rating_stats/`,
  )) as AxiosResponse<RatingStats>;
  return response.data;
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
