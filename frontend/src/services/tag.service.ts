import { fetchJSON } from "src/shared/client";
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
  const result = await fetchJSON<TagList>(`${API_URL}/level_tags/`, {
    query: getGenericSearchQuery(searchQuery),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const TagService = {
  searchTags,
};

export type { Tag, TagLite, TagList, TagSearchQuery, TagSearchResult };

export { TagService };
