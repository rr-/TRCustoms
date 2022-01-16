import { AxiosResponse } from "axios";
import type { EngineLite } from "src/services/engine.service";
import type { UploadedFile } from "src/services/file.service";
import type { GenreLite } from "src/services/genre.service";
import type { TagLite } from "src/services/tag.service";
import type { UserLite } from "src/services/user.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface Medium {
  id: number;
  file: UploadedFile;
}

interface LevelFile {
  id: number;
  version: number;
  size: number;
  created: string;
  url: string | null;
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
  genres: GenreLite[];
  tags: TagLite[];
  engine: EngineLite;
  authors: UserLite[];
  uploader: UserLite | null;
  created: string;
  last_updated: string;
  last_file: LevelFile | null;
  difficulty: LevelDifficulty;
  duration: LevelDuration;
  download_count: number;
}

interface LevelFull extends Level {
  cover: UploadedFile;
  media: Medium[];
  trle_id: number | null;
  files: LevelFile[];
  is_approved: boolean;
}

interface LevelList extends PagedResponse<Level> {}

interface LevelSearchQuery extends GenericSearchQuery {
  tags: number[];
  genres: number[];
  engines: number[];
  authors: number[];
  isApproved: boolean;
}

interface LevelSearchResult
  extends GenericSearchResult<LevelSearchQuery, Level> {}

interface MediumList extends Array<Medium> {}

const searchLevels = async (
  searchQuery: LevelSearchQuery
): Promise<LevelSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    tags: searchQuery.tags.join(","),
    genres: searchQuery.genres?.join(","),
    engines: searchQuery.engines?.join(","),
    authors: searchQuery.authors?.join(","),
    is_approved: searchQuery.isApproved ? "1" : false,
  });
  const response = (await api.get(`${API_URL}/levels/`, {
    params,
  })) as AxiosResponse<LevelSearchResult>;
  return { ...response.data, searchQuery };
};

const getLevelById = async (levelId: number): Promise<LevelFull> => {
  const response = (await api.get(
    `${API_URL}/levels/${levelId}/`
  )) as AxiosResponse<LevelFull>;
  return response.data;
};

interface LevelBaseChangePayload {
  name?: string;
  description?: string;
  engine_id?: number;
  duration_id: number;
  difficulty_id: number;
  genres?: number[];
  tag_ids?: number[];
  author_ids?: number[];
  cover_id?: number;
  screenshot_ids?: number[];
  file_id?: number;
}

interface LevelUpdatePayload extends LevelBaseChangePayload {}
interface LevelCreatePayload extends LevelBaseChangePayload {}

const update = async (
  levelId: number,
  payload: LevelUpdatePayload
): Promise<LevelFull> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.patch(
    `${API_URL}/levels/${levelId}/`,
    data
  )) as AxiosResponse<LevelFull>;
  return response.data;
};

const create = async (payload: LevelCreatePayload): Promise<LevelFull> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.post(
    `${API_URL}/levels/`,
    data
  )) as AxiosResponse<LevelFull>;
  return response.data;
};

const approve = async (levelId: number): Promise<void> => {
  await api.post(`${API_URL}/levels/${levelId}/approve/`);
};

const disapprove = async (levelId: number): Promise<void> => {
  await api.post(`${API_URL}/levels/${levelId}/disapprove/`);
};

const LevelService = {
  searchLevels,
  getLevelById,
  update,
  create,
  approve,
  disapprove,
};

export type {
  Level,
  LevelFull,
  LevelList,
  LevelSearchQuery,
  LevelSearchResult,
  Medium,
  MediumList,
};

export { LevelService };
