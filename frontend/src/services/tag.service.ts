import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface TagNested {
  id: number;
  name: string;
}

interface TagListing extends TagNested {
  level_count: number;
  created: string;
  last_updated: string;
}

interface TagSearchQuery extends GenericSearchQuery {}
interface TagSearchResult
  extends GenericSearchResult<TagSearchQuery, TagListing> {}

const searchTags = async (
  searchQuery: TagSearchQuery
): Promise<TagSearchResult> => {
  const params = getGenericSearchQuery(searchQuery);
  const response = (await api.get(`${API_URL}/level_tags/`, {
    params,
  })) as AxiosResponse<TagSearchResult>;
  return { ...response.data, searchQuery };
};

interface TagCreatePayload {
  name: string;
}

const create = async (payload: TagCreatePayload): Promise<TagListing> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.post(
    `${API_URL}/level_tags/`,
    data
  )) as AxiosResponse<TagListing>;
  return response.data;
};

const TagService = {
  searchTags,
  create,
};

export type { TagListing, TagNested, TagSearchQuery, TagSearchResult };
export { TagService };
