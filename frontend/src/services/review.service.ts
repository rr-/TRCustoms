import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { PagedResponse } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface ReviewAuthor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Review {
  level: { id: number; name: string };
  id: number;
  author: ReviewAuthor;
  rating_gameplay: number;
  rating_enemies: number;
  rating_lighting: number;
  rating_atmosphere: number;
  text: string | null;
  created: string;
  last_updated: string;
}

interface ReviewList extends PagedResponse<Review> {}

interface ReviewSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | null;
  authors?: Array<number> | null;
}

interface ReviewSearchResult
  extends GenericSearchResult<ReviewSearchQuery, Review> {}

const searchReviews = async (
  searchQuery: ReviewSearchQuery
): Promise<ReviewSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || null,
    authors: searchQuery.authors?.join(",") || null,
  });
  const response = (await api.get(`${API_URL}/level_reviews/`, {
    params,
  })) as AxiosResponse<ReviewSearchResult>;
  return { ...response.data, searchQuery };
};

const ReviewService = {
  searchReviews,
};

export type { Review, ReviewList, ReviewSearchQuery, ReviewSearchResult };

export { ReviewService };
