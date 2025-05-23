import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";

interface NewsListing {
  id: number;
  subject: string | null;
  text: string | null;
  created: string;
  last_updated: string;
}

interface NewsDetails extends NewsListing {}

interface NewsSearchQuery extends GenericSearchQuery {}

interface NewsSearchResult
  extends GenericSearchResult<NewsSearchQuery, NewsListing> {}

interface NewsBaseChangePayload {
  subject: string;
  text: string;
}

interface NewsUpdatePayload extends NewsBaseChangePayload {}
interface NewsCreatePayload extends NewsBaseChangePayload {}

const searchNews = async (
  searchQuery: NewsSearchQuery,
): Promise<NewsSearchResult> => {
  const params = filterFalsyObjectValues(getGenericSearchQuery(searchQuery));
  const response = (await api.get(`${API_URL}/news/`, {
    params,
  })) as AxiosResponse<NewsSearchResult>;
  return { ...response.data, searchQuery };
};

const getNewsById = async (newsId: number): Promise<NewsDetails> => {
  const response = (await api.get(
    `${API_URL}/news/${newsId}/`,
  )) as AxiosResponse<NewsDetails>;
  return response.data;
};

const update = async (
  newsId: number,
  payload: NewsUpdatePayload,
): Promise<NewsDetails> => {
  const data = {
    subject: payload.subject,
    text: payload.text,
  };
  const response = (await api.patch(
    `${API_URL}/news/${newsId}/`,
    data,
  )) as AxiosResponse<NewsDetails>;
  return response.data;
};

const create = async (payload: NewsCreatePayload): Promise<NewsDetails> => {
  const data = {
    subject: payload.subject,
    text: payload.text,
  };
  const response = (await api.post(
    `${API_URL}/news/`,
    data,
  )) as AxiosResponse<NewsDetails>;
  return response.data;
};

const NewsService = {
  searchNews,
  getNewsById,
  create,
  update,
};

export type { NewsDetails, NewsListing, NewsSearchQuery, NewsSearchResult };

export { NewsService };
