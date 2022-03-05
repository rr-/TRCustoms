import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UploadedFile } from "src/services/FileService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils";
import { getGenericSearchQuery } from "src/utils";

interface NewsAuthor extends UserNested {
  picture: UploadedFile | null;
}

interface NewsListing {
  id: number;
  authors: NewsAuthor[];
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
  authorIds: number[];
  subject: string;
  text: string;
}

interface NewsUpdatePayload extends NewsBaseChangePayload {}
interface NewsCreatePayload extends NewsBaseChangePayload {}

const searchNews = async (
  searchQuery: NewsSearchQuery
): Promise<NewsSearchResult> => {
  const params = filterFalsyObjectValues(getGenericSearchQuery(searchQuery));
  const response = (await api.get(`${API_URL}/news/`, {
    params,
  })) as AxiosResponse<NewsSearchResult>;
  return { ...response.data, searchQuery };
};

const getNewsById = async (newsId: number): Promise<NewsDetails> => {
  const response = (await api.get(
    `${API_URL}/news/${newsId}/`
  )) as AxiosResponse<NewsDetails>;
  return response.data;
};

const update = async (
  newsId: number,
  payload: NewsUpdatePayload
): Promise<NewsDetails> => {
  const data = {
    author_ids: payload.authorIds,
    subject: payload.subject,
    text: payload.text,
  };
  const response = (await api.patch(
    `${API_URL}/news/${newsId}/`,
    data
  )) as AxiosResponse<NewsDetails>;
  return response.data;
};

const create = async (payload: NewsCreatePayload): Promise<NewsDetails> => {
  const data = {
    author_ids: payload.authorIds,
    subject: payload.subject,
    text: payload.text,
  };
  const response = (await api.post(`${API_URL}/news/`, data)) as AxiosResponse<
    NewsDetails
  >;
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
