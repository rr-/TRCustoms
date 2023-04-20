import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { EngineNested } from "src/services/EngineService";
import type { UploadedFile } from "src/services/FileService";
import type { GenreNested } from "src/services/GenreService";
import type { TagNested } from "src/services/TagService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import type { RatingClass } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";

interface Screenshot {
  id: number;
  file: UploadedFile | null;
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

enum ExternalLinkType {
  Showcase = "sh",
  Main = "ma",
}

interface ExternalLink {
  id?: number | undefined;
  url: string;
  position: number;
  link_type: ExternalLinkType;
}

interface LevelNested {
  id: number;
  name: string;
  cover: UploadedFile | null;
}

interface LevelListing {
  id: number;
  name: string;
  description: string;
  genres: GenreNested[];
  tags: TagNested[];
  engine: EngineNested;
  authors: UserNested[];
  uploader: UserNested | null;
  created: string;
  last_updated: string;
  last_file: LevelFile | null;
  difficulty: LevelDifficulty;
  duration: LevelDuration;
  download_count: number;
  cover: UploadedFile | null;
  screenshots: Screenshot[];
  external_links: ExternalLink[];
  is_approved: boolean;
  rejection_reason: string | null;
  rating_class: RatingClass | null;
  review_count: number;
}

interface LevelDetails extends LevelListing {
  trle_id: number | null;
  files: LevelFile[];
}

interface LevelSearchQuery extends GenericSearchQuery {
  tags: number[];
  genres: number[];
  engines: number[];
  authors: number[];
  difficulties: number[];
  durations: number[];
  ratings: number[];
  isApproved: boolean | null;
  reviewsMax?: number | undefined | null;
  date?: string;
}

interface LevelSearchResult
  extends GenericSearchResult<LevelSearchQuery, LevelListing> {}

interface ScreenshotList extends Array<Screenshot> {}

const searchLevels = async (
  searchQuery: LevelSearchQuery
): Promise<LevelSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    tags: searchQuery.tags.join(","),
    genres: searchQuery.genres?.join(","),
    engines: searchQuery.engines?.join(","),
    authors: searchQuery.authors?.join(","),
    difficulties: searchQuery.difficulties?.join(","),
    durations: searchQuery.durations?.join(","),
    ratings: searchQuery.ratings?.join(","),
    is_approved:
      searchQuery.isApproved === true
        ? "1"
        : searchQuery.isApproved === false
        ? "0"
        : false,
    reviews_max: searchQuery.reviewsMax,
    date: searchQuery.date,
  });
  const response = (await api.get(`${API_URL}/levels/`, {
    params,
  })) as AxiosResponse<LevelSearchResult>;
  return { ...response.data, searchQuery };
};

const getLevelById = async (levelId: number): Promise<LevelDetails> => {
  const response = (await api.get(
    `${API_URL}/levels/${levelId}/`
  )) as AxiosResponse<LevelDetails>;
  return response.data;
};

interface LevelBaseChangePayload {
  name: string;
  description: string;
  engine_id: number;
  duration_id: number;
  difficulty_id: number;
  genre_ids: number[];
  tag_ids: number[];
  author_ids: number[];
  cover_id: number;
  screenshot_ids: number[];
  file_id?: number | undefined;
}

interface LevelUpdatePayload extends LevelBaseChangePayload {}
interface LevelCreatePayload extends LevelBaseChangePayload {}

const update = async (
  levelId: number,
  payload: LevelUpdatePayload
): Promise<LevelDetails> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.patch(
    `${API_URL}/levels/${levelId}/`,
    data
  )) as AxiosResponse<LevelDetails>;
  return response.data;
};

const create = async (payload: LevelCreatePayload): Promise<LevelDetails> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.post(
    `${API_URL}/levels/`,
    data
  )) as AxiosResponse<LevelDetails>;
  return response.data;
};

const approve = async (levelId: number): Promise<void> => {
  await api.post(`${API_URL}/levels/${levelId}/approve/`);
};

const reject = async (levelId: number, reason: string): Promise<void> => {
  const data = { reason };
  await api.post(`${API_URL}/levels/${levelId}/reject/`, data);
};

const deleteLevel = async (levelId: number): Promise<void> => {
  await api.delete(`${API_URL}/levels/${levelId}/`);
};

const LevelService = {
  searchLevels,
  getLevelById,
  update,
  create,
  approve,
  reject,
  delete: deleteLevel,
};

const formatLinkType = (linkType: ExternalLinkType): string => {
  switch (linkType) {
    case ExternalLinkType.Showcase:
      return "YouTube";
    case ExternalLinkType.Main:
      return "Website";
  }
};

const getLevelOwningUserIds = (level: LevelListing): number[] => {
  const ret = [...level.authors.map((author) => author.id)];
  if (level.uploader?.id) {
    ret.push(level.uploader.id);
  }
  return ret;
};

export type {
  ExternalLink,
  LevelDetails,
  LevelDifficulty,
  LevelDuration,
  LevelFile,
  LevelListing,
  LevelNested,
  LevelSearchQuery,
  LevelSearchResult,
  Screenshot,
  ScreenshotList,
};

export {
  ExternalLinkType,
  LevelService,
  formatLinkType,
  getLevelOwningUserIds,
};
