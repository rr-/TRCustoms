import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { PagedResponse } from "src/shared/types";
import type { GenericQuery } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericQuery } from "src/shared/utils";

interface LevelFilterQuery {}

interface LevelFilters {
  tags: { id: number; name: string }[];
  genres: { id: number; name: string }[];
  engines: { id: number; name: string }[];
}

interface Tag {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface Genre {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface Engine {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
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
  last_file_id: number | null;
  last_file_created: string | null;
  last_file_size: number | null;
  difficulty: string;
  duration: string;
}

interface LevelFull extends Level {
  banner: Medium;
  media: Medium[];
}

interface LevelQuery extends GenericQuery {
  tags: Array<number>;
  genres: Array<number>;
  engines: Array<number>;
  authors: Array<number>;
}

interface TagQuery extends GenericQuery {}

interface GenreQuery extends GenericQuery {}

interface EngineQuery extends GenericQuery {}

interface LevelList extends PagedResponse<Level> {}
interface TagList extends PagedResponse<Tag> {}
interface GenreList extends PagedResponse<Genre> {}
interface EngineList extends PagedResponse<Engine> {}
interface MediumList extends Array<Medium> {}

const getLevels = async (query: LevelQuery): Promise<LevelList | null> => {
  return await fetchJSON<LevelList>(`${API_URL}/levels/`, {
    query: filterFalsyObjectValues({
      ...getGenericQuery(query),
      tags: query.tags.join(","),
      genres: query.genres?.join(","),
      engines: query.engines?.join(","),
      authors: query.authors?.join(","),
    }),
    method: "GET",
  });
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

const getTags = async (query: TagQuery): Promise<TagList | null> => {
  return await fetchJSON<TagList>(`${API_URL}/level_tags/`, {
    query: getGenericQuery(query),
    method: "GET",
  });
};

const getGenres = async (query: GenreQuery): Promise<GenreList | null> => {
  return await fetchJSON<GenreList>(`${API_URL}/level_genres/`, {
    query: getGenericQuery(query),
    method: "GET",
  });
};

const getEngines = async (query: EngineQuery): Promise<EngineList | null> => {
  return await fetchJSON<EngineList>(`${API_URL}/level_engines/`, {
    query: getGenericQuery(query),
    method: "GET",
  });
};

const LevelService = {
  getLevels,
  getLevelById,
  getLevelFilters,
  getTags,
  getGenres,
  getEngines,
};

export type {
  Engine,
  EngineList,
  EngineQuery,
  Genre,
  GenreList,
  GenreQuery,
  Level,
  LevelAuthor,
  LevelFilterQuery,
  LevelFilters,
  LevelFull,
  LevelList,
  LevelQuery,
  LevelUploader,
  Medium,
  MediumList,
  Tag,
  TagList,
  TagQuery,
};

export { LevelService };
