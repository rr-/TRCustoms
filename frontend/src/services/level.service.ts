import type { Engine } from "src/services/engine.service";
import type { Genre } from "src/services/genre.service";
import type { Tag } from "src/services/tag.service";
import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface LevelFilterQuery {}

interface LevelFilters {
  tags: { id: number; name: string }[];
  genres: { id: number; name: string }[];
  engines: { id: number; name: string }[];
}

interface LevelUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface LevelAuthor extends LevelUser {}
interface LevelUploader extends LevelUser {}

interface Medium {
  id: number;
  url: string;
}

interface LevelFile {
  id: number;
  version: number;
  size: number;
  created: string;
  url: string;
}

interface LevelDifficulty {
  id: number;
  name: string;
}

interface LevelDuration {
  id: number;
  name: string;
}

interface Level {
  id: number | null;
  name: string;
  description: string;
  genres: Genre[];
  tags: Tag[];
  engine: Engine;
  authors: LevelAuthor[];
  uploader: LevelUploader | null;
  created: string;
  last_updated: string;
  last_file: LevelFile | null;
  difficulty: LevelDifficulty;
  duration: LevelDuration;
  download_count: number;
}

interface LevelFull extends Level {
  banner: Medium;
  media: Medium[];
  trle_id: number | null;
  files: LevelFile[];
}

interface LevelList extends PagedResponse<Level> {}

interface LevelSearchQuery extends GenericSearchQuery {
  tags: Array<number>;
  genres: Array<number>;
  engines: Array<number>;
  authors: Array<number>;
}

interface LevelSearchResult
  extends GenericSearchResult<LevelSearchQuery, Level> {}

interface MediumList extends Array<Medium> {}

const searchLevels = async (
  searchQuery: LevelSearchQuery
): Promise<LevelSearchResult | null> => {
  const result = await fetchJSON<LevelList>(`${API_URL}/levels/`, {
    query: filterFalsyObjectValues({
      ...getGenericSearchQuery(searchQuery),
      tags: searchQuery.tags.join(","),
      genres: searchQuery.genres?.join(","),
      engines: searchQuery.engines?.join(","),
      authors: searchQuery.authors?.join(","),
    }),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const getLevelById = async (levelId: number): Promise<LevelFull> => {
  return await fetchJSON<LevelFull>(`${API_URL}/levels/${levelId}/`, {
    method: "GET",
  });
};

const getLevelFilters = async (
  query: LevelFilterQuery
): Promise<LevelFilters | null> => {
  return await fetchJSON<LevelFilters>(`${API_URL}/level_filters/`, {
    method: "GET",
  });
};

const LevelService = {
  searchLevels,
  getLevelById,
  getLevelFilters,
};

export type {
  Level,
  LevelAuthor,
  LevelFilterQuery,
  LevelFilters,
  LevelFull,
  LevelList,
  LevelSearchQuery,
  LevelSearchResult,
  LevelUploader,
  Medium,
  MediumList,
};

export { LevelService };
