import {
  usersPlaylistByLevelIdRetrieve,
  usersPlaylistCreate,
  usersPlaylistDestroy,
  usersPlaylistImportCreate,
  usersPlaylistList,
  usersPlaylistPartialUpdate,
} from "src/client";
import type { PlaylistImportResult, PlaylistItem } from "src/client";
import { getPlaylistSearchQuery } from "src/services/playlistSearchQuery";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

enum PlaylistItemStatus {
  NotYetPlayed = "not_yet_played",
  Playing = "playing",
  Finished = "finished",
  Dropped = "dropped",
  OnHold = "on_hold",
}

type PlaylistItemListing = PlaylistItem;
type PlaylistItemDetails = PlaylistItem;

interface PlaylistItemCreatePayload {
  levelId: number;
  status: PlaylistItemStatus;
}

interface PlaylistItemUpdatePayload {
  status: PlaylistItemStatus;
}

interface PlaylistSearchQuery extends GenericSearchQuery {
  userId: number;
}

interface PlaylistSearchResult
  extends GenericSearchResult<PlaylistSearchQuery, PlaylistItemListing> {}

const search = async (
  userId: number,
  searchQuery: PlaylistSearchQuery,
): Promise<PlaylistSearchResult> => {
  const { data } = await usersPlaylistList({
    path: { user_id: userId },
    query: getGenericSearchQuery(searchQuery),
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const get = async (
  userId: number,
  levelId: number,
): Promise<PlaylistItemDetails> => {
  const { data } = await usersPlaylistByLevelIdRetrieve({
    path: { user_id: userId, level_id: levelId },
    throwOnError: true,
  });
  return data;
};

const create = async (
  userId: number,
  { levelId, status }: PlaylistItemCreatePayload,
): Promise<PlaylistItemListing> => {
  const { data } = await usersPlaylistCreate({
    path: { user_id: userId },
    body: { level_id: levelId, status },
    throwOnError: true,
  });
  return data;
};

const update = async (
  userId: number,
  playlistItemId: number,
  { status }: PlaylistItemUpdatePayload,
): Promise<PlaylistItemListing> => {
  const { data } = await usersPlaylistPartialUpdate({
    path: { user_id: userId, id: playlistItemId },
    body: { status },
    throwOnError: true,
  });
  return data;
};

const import_ = async (userId: number): Promise<PlaylistImportResult> => {
  const { data } = await usersPlaylistImportCreate({
    path: { user_id: userId },
    throwOnError: true,
  });
  return data;
};

const delete_ = async (
  userId: number,
  playlistItemId: number,
): Promise<void> => {
  await usersPlaylistDestroy({
    path: { user_id: userId, id: playlistItemId },
    throwOnError: true,
  });
};

const PlaylistService = {
  getSearchQuery: getPlaylistSearchQuery,
  search,
  get,
  create,
  update,
  delete: delete_,
  import: import_,
};

export type {
  PlaylistItemDetails,
  PlaylistItemListing,
  PlaylistSearchQuery,
  PlaylistSearchResult,
  PlaylistImportResult,
};

export { PlaylistItemStatus, PlaylistService, getPlaylistSearchQuery };
