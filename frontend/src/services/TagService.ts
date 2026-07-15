import {
  levelTagsByNameRetrieve,
  levelTagsCreate,
  levelTagsDestroy,
  levelTagsList,
  levelTagsMergeCreate,
  levelTagsPartialUpdate,
  levelTagsStatsList,
} from "src/client";
import type { TagListing, TagNested } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface TagSearchQuery extends GenericSearchQuery {}
interface TagSearchResult
  extends GenericSearchResult<TagSearchQuery, TagListing> {}

const searchTags = async (
  searchQuery: TagSearchQuery,
): Promise<TagSearchResult> => {
  const { data } = await levelTagsList({
    query: getGenericSearchQuery(searchQuery),
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const getByName = async (name: string): Promise<TagListing> => {
  const { data } = await levelTagsByNameRetrieve({
    path: { name },
    throwOnError: true,
  });
  return data;
};

const getStats = async (tagId: number): Promise<TagListing[]> => {
  const { data } = await levelTagsStatsList({
    path: { id: tagId },
    throwOnError: true,
  });
  return data;
};

const create = async (payload: { name: string }): Promise<TagListing> => {
  const { data } = await levelTagsCreate({
    body: payload,
    throwOnError: true,
  });
  return data;
};

const update = async (
  tagId: number,
  { name }: { name: string },
): Promise<TagListing> => {
  const { data } = await levelTagsPartialUpdate({
    path: { id: tagId },
    body: { name },
    throwOnError: true,
  });
  return data;
};

const deleteTag = async (tagId: number): Promise<void> => {
  await levelTagsDestroy({ path: { id: tagId }, throwOnError: true });
};

const merge = async (
  sourceTagId: number,
  targetTagId: number,
): Promise<void> => {
  await levelTagsMergeCreate({
    path: { id: sourceTagId },
    body: { target_tag_id: targetTagId },
    throwOnError: true,
  });
};

const TagService = {
  searchTags,
  getStats,
  getByName,
  create,
  update,
  delete: deleteTag,
  merge,
};

export type { TagListing, TagNested, TagSearchQuery, TagSearchResult };
export { TagService };
