import {
  newsCreate,
  newsList,
  newsPartialUpdate,
  newsRetrieve,
} from "src/client";
import type { NewsDetails, NewsListing } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

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
  const { data } = await newsList({
    query: getGenericSearchQuery(searchQuery),
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const getNewsById = async (newsId: number): Promise<NewsDetails> => {
  const { data } = await newsRetrieve({
    path: { id: newsId },
    throwOnError: true,
  });
  return data;
};

const update = async (
  newsId: number,
  payload: NewsUpdatePayload,
): Promise<NewsDetails> => {
  const { data } = await newsPartialUpdate({
    path: { id: newsId },
    body: { subject: payload.subject, text: payload.text },
    throwOnError: true,
  });
  return data;
};

const create = async (payload: NewsCreatePayload): Promise<NewsDetails> => {
  const { data } = await newsCreate({
    body: { subject: payload.subject, text: payload.text },
    throwOnError: true,
  });
  return data;
};

const NewsService = {
  searchNews,
  getNewsById,
  create,
  update,
};

export type { NewsDetails, NewsListing, NewsSearchQuery, NewsSearchResult };

export { NewsService };
