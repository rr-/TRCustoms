import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils";
import { getGenericSearchQuery } from "src/utils";

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

const getByName = async (name: string): Promise<TagListing> => {
  const params = { name: name };
  const response = (await api.get(`${API_URL}/level_tags/by_name/`, {
    params,
  })) as AxiosResponse<TagListing>;
  return response.data;
};

interface TagCreatePayload {
  name: string;
}

interface TagUpdatePayload extends TagCreatePayload {}

const getStats = async (tagId: number): Promise<TagListing[]> => {
  const response = (await api.get(
    `${API_URL}/level_tags/${tagId}/stats/`
  )) as AxiosResponse<TagListing[]>;
  return response.data;
};

const create = async (payload: TagCreatePayload): Promise<TagListing> => {
  const data: { [key: string]: any } = filterFalsyObjectValues(payload);
  const response = (await api.post(
    `${API_URL}/level_tags/`,
    data
  )) as AxiosResponse<TagListing>;
  return response.data;
};

const update = async (
  tagId: number,
  { name }: TagUpdatePayload
): Promise<TagListing> => {
  const data: { [key: string]: any } = {
    name: name,
  };
  const response = (await api.patch(
    `${API_URL}/level_tags/${tagId}/`,
    data
  )) as AxiosResponse<TagListing>;
  return response.data;
};

const deleteTag = async (tagId: number): Promise<void> => {
  await api.delete(`${API_URL}/level_tags/${tagId}/`);
};

const merge = async (
  sourceTagId: number,
  targetTagId: number
): Promise<void> => {
  await api.post(`${API_URL}/level_tags/${sourceTagId}/merge/${targetTagId}/`);
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