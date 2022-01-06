import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { getGenericSearchQuery } from "src/shared/utils";

interface GenreLite {
  id: number;
  name: string;
  description: string;
}

interface Genre extends GenreLite {
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
): Promise<GenreSearchResult> => {
  const result = await fetchJSON<GenreList>(`${API_URL}/level_genres/`, {
    query: getGenericSearchQuery(searchQuery),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const GenreService = {
  searchGenres,
};

export type {
  Genre,
  GenreLite,
  GenreList,
  GenreSearchQuery,
  GenreSearchResult,
};

export { GenreService };
