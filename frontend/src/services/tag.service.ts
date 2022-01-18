import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface TagLite {
  id: number;
  name: string;
}

interface Tag extends TagLite {
  level_count: number;
  created: string;
  last_updated: string;
}

interface TagList extends PagedResponse<Tag> {}
interface TagSearchQuery extends GenericSearchQuery {}
interface TagSearchResult extends GenericSearchResult<TagSearchQuery, Tag> {}

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
  name?: string;
}

const create = async (payload: TagCreatePayload): Promise<Tag> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.post(
    `${API_URL}/level_tags/`,
    data
  )) as AxiosResponse<Tag>;
  return response.data;
};

const TagService = {
  searchTags,
  create,
};

export type { Tag, TagLite, TagList, TagSearchQuery, TagSearchResult };

export { TagService };
