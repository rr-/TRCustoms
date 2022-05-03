import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UploadedFile } from "src/services/FileService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";

enum WalkthroughType {
  Link = "l",
  Text = "t",
}

interface WalkthroughAuthor extends UserNested {
  picture: UploadedFile | null;
  reviewed_level_count: number;
}

interface WalkthroughListing {
  level: { id: number; name: string };
  id: number;
  author: WalkthroughAuthor | null;
  legacy_author_name: string | null;
  text: string;
  walkthrough_type: WalkthroughType;
  created: string;
  last_updated: string;
  is_approved: boolean;
  is_pending_approval: boolean;
  rejection_reason: string | null;
}

interface WalkthroughDetails extends WalkthroughListing {}

interface WalkthroughCreatePayload {
  levelId: number;
  walkthroughType: WalkthroughType;
  text: string;
}

interface WalkthroughUpdatePayload {
  text: string;
}

interface WalkthroughSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | undefined;
  authors?: Array<number> | undefined;
}

interface WalkthroughSearchResult
  extends GenericSearchResult<WalkthroughSearchQuery, WalkthroughListing> {}

const searchWalkthroughs = async (
  searchQuery: WalkthroughSearchQuery
): Promise<WalkthroughSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    levels: searchQuery.levels?.join(",") || null,
    authors: searchQuery.authors?.join(",") || null,
  });
  const response = (await api.get(`${API_URL}/walkthroughs/`, {
    params,
  })) as AxiosResponse<WalkthroughSearchResult>;
  return { ...response.data, searchQuery };
};

const getWalkthroughById = async (
  walkthroughId: number
): Promise<WalkthroughDetails> => {
  const response = (await api.get(
    `${API_URL}/walkthroughs/${walkthroughId}/`
  )) as AxiosResponse<WalkthroughDetails>;
  return response.data;
};

const getWalkthroughByAuthorAndLevelIds = async (
  levelId: number,
  authorId: number
): Promise<WalkthroughDetails | null> => {
  const reviews = await searchWalkthroughs({
    authors: [authorId],
    levels: [levelId],
  });
  if (reviews.results.length) {
    return await getWalkthroughById(reviews.results[0].id);
  }
  return null;
};

const create = async ({
  levelId,
  walkthroughType,
  text,
}: WalkthroughCreatePayload): Promise<WalkthroughListing> => {
  const data: { [key: string]: any } = {
    level_id: levelId,
    walkthrough_type: walkthroughType,
    text,
  };
  const response = (await api.post(
    `${API_URL}/walkthroughs/`,
    data
  )) as AxiosResponse<WalkthroughListing>;
  return response.data;
};

const update = async (
  walkthroughId: number,
  { text }: WalkthroughUpdatePayload
): Promise<WalkthroughListing> => {
  const data = { text };
  const response = (await api.patch(
    `${API_URL}/walkthroughs/${walkthroughId}/`,
    data
  )) as AxiosResponse<WalkthroughListing>;
  return response.data;
};

const approve = async (walkthroughId: number): Promise<void> => {
  await api.post(`${API_URL}/walkthroughs/${walkthroughId}/approve/`);
};

const reject = async (walkthroughId: number, reason: string): Promise<void> => {
  const data = { reason };
  await api.post(`${API_URL}/walkthroughs/${walkthroughId}/reject/`, data);
};

const deleteWalkthrough = async (walkthroughId: number): Promise<void> => {
  await api.delete(`${API_URL}/walkthroughs/${walkthroughId}/`);
};

const WalkthroughService = {
  searchWalkthroughs,
  getWalkthroughById,
  getWalkthroughByAuthorAndLevelIds,
  create,
  update,
  approve,
  reject,
  delete: deleteWalkthrough,
};

export type {
  WalkthroughDetails,
  WalkthroughListing,
  WalkthroughSearchQuery,
  WalkthroughSearchResult,
};

export { WalkthroughType, WalkthroughService };
