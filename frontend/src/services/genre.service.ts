import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { getGenericSearchQuery } from "src/shared/utils";

interface Genre {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface GenreList extends PagedResponse<Genre> {}
interface GenreSearchQuery extends GenericSearchQuery {}
interface GenreSearchResult
  extends GenericSearchResult<GenreSearchQuery, Genre> {}

const searchGenres = async (
  searchQuery: GenreSearchQuery
): Promise<GenreSearchResult | null> => {
  const result = await fetchJSON<GenreList>(`${API_URL}/level_genres/`, {
    query: getGenericSearchQuery(searchQuery),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const GenreService = {
  searchGenres,
};

export type { Genre, GenreList, GenreSearchQuery, GenreSearchResult };

export { GenreService };
