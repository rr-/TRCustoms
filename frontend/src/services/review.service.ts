import { AxiosResponse } from "axios";
import type { UploadedFile } from "src/services/file.service";
import type { UserNested } from "src/services/user.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import type { RatingClass } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface ReviewAuthor extends UserNested {
  picture: UploadedFile | null;
  reviewed_level_count: number;
}

interface ReviewListing {
  level: { id: number; name: string };
  id: number;
  author: ReviewAuthor;
  text: string | null;
  rating_class: RatingClass | null;
  created: string;
  last_updated: string;
}

interface ReviewDetails extends ReviewListing {
  answers: number[];
}

interface ReviewSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | undefined;
  authors?: Array<number> | undefined;
}

interface ReviewSearchResult
  extends GenericSearchResult<ReviewSearchQuery, ReviewListing> {}

interface ReviewBaseChangePayload {
  levelId: number;
  text: string;
  answerIds: number[];
}

interface ReviewUpdatePayload extends ReviewBaseChangePayload {}
interface ReviewCreatePayload extends ReviewBaseChangePayload {}

const searchReviews = async (
  searchQuery: ReviewSearchQuery
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
    `${API_URL}/reviews/${reviewId}/`
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const getReviewByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number
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
  payload: ReviewUpdatePayload
): Promise<ReviewDetails> => {
  const data = {
    level_id: payload.levelId,
    text: payload.text,
    answer_ids: payload.answerIds,
  };
  const response = (await api.patch(
    `${API_URL}/reviews/${reviewId}/`,
    data
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const create = async (payload: ReviewCreatePayload): Promise<ReviewDetails> => {
  const data = {
    level_id: payload.levelId,
    text: payload.text,
    answer_ids: payload.answerIds,
  };
  const response = (await api.post(
    `${API_URL}/reviews/`,
    data
  )) as AxiosResponse<ReviewDetails>;
  return response.data;
};

const ReviewService = {
  searchReviews,
  getReviewById,
  getReviewByAuthorAndLevelIds,
  create,
  update,
};

export type {
  ReviewDetails,
  ReviewListing,
  ReviewSearchQuery,
  ReviewSearchResult,
};

export { ReviewService };
