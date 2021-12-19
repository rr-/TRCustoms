import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import { IPagedResponse } from "src/shared/types";
import { IGenericQuery } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";

interface ILevelFilterQuery {}

interface ILevelFilters {
  tags: { id: number; name: string }[];
  genres: { id: number; name: string }[];
  engines: { id: number; name: string }[];
}

interface ITag {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface IGenre {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface IEngine {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface ILevelUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}
interface ILevelAuthor extends ILevelUser {}
interface ILevelUploader extends ILevelUser {}

interface ILevel {
  id: number | null;
  name: string;
  description: string;
  genres: IGenre[];
  tags: ITag[];
  engine: IEngine;
  authors: ILevelAuthor[];
  uploader: ILevelUploader | null;
  created: string;
  last_updated: string;
  last_file_id: number | null;
  last_file_created: string | null;
  last_file_size: number | null;
}

interface ILevelQuery extends IGenericQuery {
  tags: Array<number>;
  genres: Array<number>;
  engines: Array<number>;
  authors: Array<number>;
}

interface ITagQuery extends IGenericQuery {}

interface IGenreQuery extends IGenericQuery {}

interface IEngineQuery extends IGenericQuery {}

interface ILevelList extends IPagedResponse<ILevel> {}
interface ITagList extends IPagedResponse<ITag> {}
interface IGenreList extends IPagedResponse<IGenre> {}
interface IEngineList extends IPagedResponse<IEngine> {}

const getLevels = async (query: ILevelQuery): Promise<ILevelList | null> => {
  return await fetchJSON<ILevelList>(`${API_URL}/levels/`, {
    query: filterFalsyObjectValues({
      page: query.page ? `${query.page}` : null,
      sort: query.sort,
      search: query.search,
      tags: query.tags.join(","),
      genres: query.genres?.join(","),
      engines: query.engines?.join(","),
      authors: query.authors?.join(","),
    }),
    method: "GET",
  });
};

const getLevelFilters = async (
  query: ILevelFilterQuery
): Promise<ILevelFilters | null> => {
  return await fetchJSON<ILevelFilters>(`${API_URL}/level_filters/`, {
    method: "GET",
  });
};

const getTags = async (query: ITagQuery): Promise<ITagList | null> => {
  return await fetchJSON<ITagList>(`${API_URL}/level_tags/`, {
    query: filterFalsyObjectValues({
      page: query.page ? `${query.page}` : null,
      sort: query.sort,
      search: query.search,
    }),
    method: "GET",
  });
};

const getGenres = async (query: IGenreQuery): Promise<IGenreList | null> => {
  return await fetchJSON<IGenreList>(`${API_URL}/level_genres/`, {
    query: filterFalsyObjectValues({
      page: query.page ? `${query.page}` : null,
      sort: query.sort,
      search: query.search,
    }),
    method: "GET",
  });
};

const getEngines = async (query: IEngineQuery): Promise<IEngineList | null> => {
  return await fetchJSON<IEngineList>(`${API_URL}/level_engines/`, {
    query: filterFalsyObjectValues({
      page: query.page ? `${query.page}` : null,
      sort: query.sort,
      search: query.search,
    }),
    method: "GET",
  });
};

const LevelService = {
  getLevels,
  getLevelFilters,
  getTags,
  getGenres,
  getEngines,
};

export type {
  IEngine,
  IEngineList,
  IEngineQuery,
  IGenre,
  IGenreList,
  IGenreQuery,
  ILevel,
  ILevelFilterQuery,
  ILevelFilters,
  ILevelList,
  ILevelQuery,
  ITag,
  ITagList,
  ITagQuery,
  ILevelAuthor,
  ILevelUploader,
};

export { LevelService };
