import {
  reviewsCreate,
  reviewsDestroy,
  reviewsHideCreate,
  reviewsList,
  reviewsPartialUpdate,
  reviewsRetrieve,
  reviewsVoteCreate,
  reviewsVotersList,
} from "src/client";
import type { ReviewDetails, ReviewListing, ReviewVoter } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

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
interface ReviewHidePayload {
  reason: string;
}

interface ReviewVotePayload {
  vote: -1 | 1;
}

const searchReviews = async (
  searchQuery: ReviewSearchQuery,
): Promise<ReviewSearchResult> => {
  const query: Record<string, string | number | null | undefined> = {
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || undefined,
    authors: searchQuery.authors?.join(",") || undefined,
  };
  const { data } = await reviewsList({ query, throwOnError: true });
  return { ...data, searchQuery };
};

const getReviewById = async (reviewId: number): Promise<ReviewDetails> => {
  const { data } = await reviewsRetrieve({
    path: { id: reviewId },
    throwOnError: true,
  });
  return data;
};

const getReviewByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number | undefined,
): Promise<ReviewDetails | null> => {
  if (authorId === undefined) {
    return null;
  }
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
  const { data } = await reviewsPartialUpdate({
    path: { id: reviewId },
    body: { level_id: payload.levelId, text: payload.text },
    throwOnError: true,
  });
  return data;
};

const create = async (payload: ReviewCreatePayload): Promise<ReviewDetails> => {
  const { data } = await reviewsCreate({
    body: { level_id: payload.levelId, text: payload.text },
    throwOnError: true,
  });
  return data;
};

const deleteReview = async (reviewId: number): Promise<void> => {
  await reviewsDestroy({ path: { id: reviewId }, throwOnError: true });
};

const hide = async (
  reviewId: number,
  payload: ReviewHidePayload,
): Promise<void> => {
  await reviewsHideCreate({
    path: { id: reviewId },
    body: payload,
    throwOnError: true,
  });
};

const vote = async (
  reviewId: number,
  payload: ReviewVotePayload,
): Promise<ReviewListing> => {
  const { data } = await reviewsVoteCreate({
    path: { id: reviewId },
    body: payload,
    throwOnError: true,
  });
  return data;
};

const getVoters = async (reviewId: number): Promise<ReviewVoter[]> => {
  const { data } = await reviewsVotersList({
    path: { id: reviewId },
    throwOnError: true,
  });
  return data;
};

const ReviewService = {
  searchReviews,
  getReviewById,
  getReviewByAuthorAndLevelIds,
  create,
  update,
  delete: deleteReview,
  hide,
  vote,
  getVoters,
};

export type {
  ReviewDetails,
  ReviewListing,
  ReviewVoter,
  ReviewSearchQuery,
  ReviewSearchResult,
};

export { ReviewService };
