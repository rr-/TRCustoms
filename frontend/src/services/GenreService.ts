import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface GenreNested {
  id: number;
  name: string;
}

interface GenreListing {
  id: number;
  name: string;
  description: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface GenreSearchQuery extends GenericSearchQuery {}
interface GenreSearchResult
  extends GenericSearchResult<GenreSearchQuery, GenreListing> {}

const searchGenres = async (
  searchQuery: GenreSearchQuery,
): Promise<GenreSearchResult> => {
  const params = getGenericSearchQuery(searchQuery);
  const response = (await api.get(`${API_URL}/level_genres/`, {
    params,
  })) as AxiosResponse<GenreSearchResult>;
  return { ...response.data, searchQuery };
};

const getStats = async (genreId: number): Promise<GenreListing[]> => {
  const response = (await api.get(
    `${API_URL}/level_genres/${genreId}/stats/`,
  )) as AxiosResponse<GenreListing[]>;
  return response.data;
};

const GenreService = {
  searchGenres,
  getStats,
};

export type { GenreListing, GenreNested, GenreSearchQuery, GenreSearchResult };

export { GenreService };
