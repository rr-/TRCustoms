import { levelGenresList, levelGenresStatsList } from "src/client";
import type { GenreListing, GenreNested } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface GenreSearchQuery extends GenericSearchQuery {}
interface GenreSearchResult
  extends GenericSearchResult<GenreSearchQuery, GenreListing> {}

const searchGenres = async (
  searchQuery: GenreSearchQuery,
): Promise<GenreSearchResult> => {
  const { data } = await levelGenresList({
    query: getGenericSearchQuery(searchQuery),
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const getStats = async (genreId: number): Promise<GenreListing[]> => {
  const { data } = await levelGenresStatsList({
    path: { id: genreId },
    throwOnError: true,
  });
  return data;
};

const GenreService = {
  searchGenres,
  getStats,
};

export type { GenreListing, GenreNested, GenreSearchQuery, GenreSearchResult };

export { GenreService };
