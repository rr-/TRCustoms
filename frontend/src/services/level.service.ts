import { IUser } from "src/services/user.service";
import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import { IPagedResponse } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";

interface ILevelEngine {
  id: number;
  name: string;
}

interface ILevelTag {
  id: number;
  name: string;
}

interface ILevelGenre {
  id: number;
  name: string;
}

interface ILevelAuthor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface ILevel {
  id: number | null;
  name: string;
  description: string;
  genres: ILevelGenre[];
  tags: ILevelTag[];
  engine: ILevelEngine;
  authors: ILevelAuthor[];
  uploader: IUser | null;
  created: string;
  last_updated: string;
  last_file_id: number | null;
  last_file_created: string | null;
  last_file_size: number | null;
}

interface ILevelQuery {
  page: number | null;
  sort: string | null;
  search: string;
  tags: Array<number>;
  genres: Array<number>;
  engines: Array<number>;
}

interface ILevelList extends IPagedResponse<ILevel> {}
interface ILevelTagList extends Array<ILevelTag> {}
interface ILevelGenreList extends Array<ILevelGenre> {}
interface ILevelEngineList extends Array<ILevelEngine> {}

const getLevels = async (query: ILevelQuery): Promise<ILevelList | null> => {
  let data;
  try {
    data = await fetchJSON<ILevelList>(`${API_URL}/levels/`, {
      query: filterFalsyObjectValues({
        page: query.page ? `${query.page}` : null,
        sort: query.sort,
        search: query.search,
        tags: query.tags.join(","),
        genres: query.genres?.join(","),
        engines: query.engines?.join(","),
      }),
      method: "GET",
    });
  } catch (error) {
    data = null;
  }
  return data;
};

const getLevelTags = async (): Promise<ILevelTagList | null> => {
  let data;
  try {
    data = await fetchJSON<ILevelTagList>(`${API_URL}/level_tags/`, {
      method: "GET",
    });
  } catch (error) {
    data = null;
  }
  return data;
};

const getLevelGenres = async (): Promise<ILevelGenreList | null> => {
  let data;
  try {
    data = await fetchJSON<ILevelGenreList>(`${API_URL}/level_genres/`, {
      method: "GET",
    });
  } catch (error) {
    data = null;
  }
  return data;
};

const getLevelEngines = async (): Promise<ILevelEngineList | null> => {
  let data;
  try {
    data = await fetchJSON<ILevelEngineList>(`${API_URL}/level_engines/`, {
      method: "GET",
    });
  } catch (error) {
    data = null;
  }
  return data;
};

const LevelService = {
  getLevels,
  getLevelTags,
  getLevelGenres,
  getLevelEngines,
};

export type {
  ILevelQuery,
  ILevel,
  ILevelList,
  ILevelTagList,
  ILevelGenreList,
  ILevelEngineList,
};
export { LevelService };
