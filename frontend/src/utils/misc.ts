import axios from "axios";
import { AxiosError } from "axios";
import { isString } from "lodash";
import { isArray } from "lodash";
import { DISABLE_PAGING } from "src/constants";
import type { GenericSearchQuery } from "src/types";

const getGenericSearchQuery = (
  searchQuery: GenericSearchQuery
): { [key: string]: any } => {
  return filterFalsyObjectValues({
    page:
      searchQuery.page && searchQuery.page !== DISABLE_PAGING
        ? `${searchQuery.page}`
        : null,
    page_size: searchQuery.pageSize,
    sort: searchQuery.sort,
    search: searchQuery.search,
    disable_paging: searchQuery.page === DISABLE_PAGING ? "1" : null,
  });
};

const getCurrentSearchParams = (): { [key: string]: string } => {
  return Object.fromEntries(new URL(window.location.href).searchParams);
};

const filterFalsyObjectValues = <T extends any>(source: {
  [key: string]: T | null;
}): { [key: string]: T } => {
  return Object.fromEntries(
    Object.entries(source).filter(([_key, value]) => !!value)
  ) as { [key: string]: T };
};

const extractNestedErrorText = (source: any): string[] => {
  if (source === null || source === undefined) {
    return [];
  }
  if (isArray(source)) {
    return source.reduce(
      (acc: string[], item: any) => [...acc, ...extractNestedErrorText(item)],
      []
    );
  }
  if (isString(source)) {
    return [source];
  }
  return Object.values(source).reduce(
    (acc: string[], item: any) => [...acc, ...extractNestedErrorText(item)],
    []
  );
};

interface YoutubeLink {
  videoID: string;
  playlistID: string;
}

const parseYoutubeLink = (url: string): YoutubeLink | null => {
  let regExp = new RegExp(
    "" +
      /^https?:\/\//.source +
      /(?:www\.)?/.source +
      /(?:youtube\.com|youtu\.be)\//.source +
      /(?:v\/|\/u\/\w\/|embed\/|watch\?)?/.source +
      /\??(?:v=)?(?<videoID>[^#&?]*)/.source +
      /(?:&list=(?<playlistID>[^&#*?]+))?/.source +
      /.*/.source
  );
  let match = url.match(regExp);
  if (!match?.groups) {
    return null;
  }
  const videoID = match.groups.videoID;
  const playlistID = match.groups.playlistID;
  return { videoID, playlistID };
};

const extractErrorMessage = (error: unknown) => {
  if (!error) {
    return null;
  }
  if (!axios.isAxiosError(error)) {
    return error;
  }
  const axiosError = error as AxiosError;
  if (isString(axiosError.response?.data)) {
    return axiosError.response?.data;
  }
  if (axiosError.response?.data.detail) {
    return axiosError.response?.data.detail;
  }
  const values = Object.values(axiosError.response?.data);
  if (values.length === 1 && isString(values[0])) {
    return values[0];
  }
  if (
    values.length === 1 &&
    isArray(values[0]) &&
    values[0].length === 1 &&
    isString(values[0][0])
  ) {
    return values[0][0];
  }
  return "Unknown error";
};

const showAlertOnError = async (func: () => Promise<void>): Promise<void> => {
  try {
    await func();
  } catch (error) {
    const message = extractErrorMessage(error);
    if (message) {
      alert(message);
    }
  }
};

const resetQueries = (
  queryClient: any,
  queryFilters: any,
  soft?: boolean | undefined
) => {
  for (let queryFilter of queryFilters) {
    if (!soft) {
      queryClient
        .getQueryCache()
        .findAll(queryFilter)
        .forEach((query: any) => query.setData(undefined));
    }
    queryClient.invalidateQueries(queryFilter);
  }
};

export {
  filterFalsyObjectValues,
  getGenericSearchQuery,
  getCurrentSearchParams,
  extractNestedErrorText,
  extractErrorMessage,
  parseYoutubeLink,
  showAlertOnError,
  resetQueries,
};
