import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UploadedFile } from "src/services/FileService";
import type { LevelNested } from "src/services/LevelService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";

enum PlaylistItemStatus {
  NotYetPlayed = "not_yet_played",
  Playing = "playing",
  Finished = "finished",
  Dropped = "dropped",
  OnHold = "on_hold",
}

interface PlaylistItemPlayer extends UserNested {
  picture: UploadedFile | null;
  reviewed_level_count: number;
}

interface PlaylistItemListing {
  id: number;
  level: LevelNested;
  user: PlaylistItemPlayer;
  status: PlaylistItemStatus;
  created: string;
  last_updated: string;
}

interface PlaylistItemDetails extends PlaylistItemListing {}

interface PlaylistItemCreatePayload {
  levelId: number;
  status: PlaylistItemStatus;
}

interface PlaylistItemUpdatePayload {
  status: PlaylistItemStatus;
}

interface PlaylistSearchQuery extends GenericSearchQuery {}

interface PlaylistSearchResult
  extends GenericSearchResult<PlaylistSearchQuery, PlaylistItemListing> {}

const search = async (
  userId: number,
  searchQuery: PlaylistSearchQuery
): Promise<PlaylistSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
  });
  const response = (await api.get(`${API_URL}/users/${userId}/playlist/`, {
    params,
  })) as AxiosResponse<PlaylistSearchResult>;
  return { ...response.data, searchQuery };
};

const get = async (
  userId: number,
  levelId: number
): Promise<PlaylistItemDetails> => {
  const response = (await api.get(
    `${API_URL}/users/${userId}/playlist/by_level_id/${levelId}/`
  )) as AxiosResponse<PlaylistItemDetails>;
  return { ...response.data };
};

const create = async (
  userId: number,
  { levelId, status }: PlaylistItemCreatePayload
): Promise<PlaylistItemListing> => {
  const data: { [key: string]: any } = {
    level_id: levelId,
    status,
  };
  const response = (await api.post(
    `${API_URL}/users/${userId}/playlist/`,
    data
  )) as AxiosResponse<PlaylistItemListing>;
  return response.data;
};

const update = async (
  userId: number,
  playlistItemId: number,
  { status }: PlaylistItemUpdatePayload
): Promise<PlaylistItemListing> => {
  const data = { status };
  const response = (await api.patch(
    `${API_URL}/users/${userId}/playlist/${playlistItemId}/`,
    data
  )) as AxiosResponse<PlaylistItemListing>;
  return response.data;
};

const delete_ = async (
  userId: number,
  playlistItemId: number
): Promise<void> => {
  await api.delete(`${API_URL}/users/${userId}/playlist/${playlistItemId}/`);
};

const PlaylistService = {
  search,
  get,
  create,
  update,
  delete: delete_,
};

export type {
  PlaylistItemDetails,
  PlaylistItemListing,
  PlaylistSearchQuery,
  PlaylistSearchResult,
};

export { PlaylistItemStatus, PlaylistService };
