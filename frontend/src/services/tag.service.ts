import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
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

const TagService = {
  searchTags,
};

export type { Tag, TagLite, TagList, TagSearchQuery, TagSearchResult };

export { TagService };
