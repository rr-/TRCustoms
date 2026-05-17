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

interface ReviewAuthor extends UserNested {
  reviewed_level_count: number;
}

interface ReviewListing {
  level: LevelNested;
  id: number;
  author: ReviewAuthor;
  text: string | null;
  rating_class: RatingClass | null;
  created: string;
  last_updated: string;
  last_user_content_updated: string;
  upvote_count: number;
  downvote_count: number;
  current_user_vote: number | null;
  can_vote: boolean;
}

interface ReviewDetails extends ReviewListing {}

interface ReviewSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | undefined;
  authors?: Array<number> | undefined;
}

interface ReviewSearchResult
  extends GenericSearchResult<ReviewSearchQuery, ReviewListing> {}

interface ReviewBaseChangePayload {
  levelId: number;
  text: string;
}

interface ReviewUpdatePayload extends ReviewBaseChangePayload {}
interface ReviewCreatePayload extends ReviewBaseChangePayload {}
interface ReviewDeletePayload {
  reason: string;
}

interface ReviewVotePayload {
  vote: -1 | 1;
}

const searchReviews = async (
  searchQuery: ReviewSearchQuery,
): Promise<ReviewSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || null,
    authors: searchQuery.authors?.join(",") || null,
  });
  const response = (await api.get(`${API_URL}/reviews/`, {
    params,
  })) as AxiosResponse<ReviewSearchResult>;
  return { ...response.data, searchQuery };
};

const getReviewById = async (reviewId: number): Promise<ReviewDetails> => {
  const response = (await api.get(
    `${API_URL}/reviews/${reviewId}/`,
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const getReviewByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number,
): Promise<ReviewDetails | null> => {
  const reviews = await searchReviews({
    authors: [authorId],
    levels: [levelId],
  });
  if (reviews.results.length) {
    return await getReviewById(reviews.results[0].id);
  }
  return null;
};

const update = async (
  reviewId: number,
  payload: ReviewUpdatePayload,
): Promise<ReviewDetails> => {
  const data = {
    level_id: payload.levelId,
    text: payload.text,
  };
  const response = (await api.patch(
    `${API_URL}/reviews/${reviewId}/`,
    data,
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const create = async (payload: ReviewCreatePayload): Promise<ReviewDetails> => {
  const data = {
    level_id: payload.levelId,
    text: payload.text,
  };
  const response = (await api.post(
    `${API_URL}/reviews/`,
    data,
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const deleteReview = async (
  reviewId: number,
  payload: ReviewDeletePayload,
): Promise<void> => {
  await api.delete(`${API_URL}/reviews/${reviewId}/`, { data: payload });
};

const vote = async (
  reviewId: number,
  payload: ReviewVotePayload,
): Promise<ReviewDetails> => {
  const response = (await api.post(
    `${API_URL}/reviews/${reviewId}/vote/`,
    payload,
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const ReviewService = {
  searchReviews,
  getReviewById,
  getReviewByAuthorAndLevelIds,
  create,
  update,
  delete: deleteReview,
  vote,
};

export type {
  ReviewDetails,
  ReviewListing,
  ReviewSearchQuery,
  ReviewSearchResult,
};

export { ReviewService };
