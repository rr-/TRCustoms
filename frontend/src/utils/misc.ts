import type { QueryClient } from "@tanstack/react-query";
import type { QueryFilters } from "@tanstack/react-query";
import { isString } from "lodash";
import { isArray } from "lodash";
import { DISABLE_PAGING } from "src/constants";
import type { GenericSearchQuery } from "src/types";

const getGenericSearchQuery = (
  searchQuery: GenericSearchQuery,
): Record<string, string | number | null | undefined> => {
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

const filterFalsyObjectValues = <T>(source: {
  [key: string]: T | null;
}): { [key: string]: T } => {
  return Object.fromEntries(
    Object.entries(source).filter(([_key, value]) => !!value),
  ) as { [key: string]: T };
};

const boolToSearchString = (
  value: boolean | null | undefined,
): string | null => {
  return value === true ? "1" : value === false ? "0" : null;
};

const searchStringToBool = (
  value: string | null | undefined,
): boolean | null => {
  return value === "1" ? true : value === "0" ? false : null;
};

const extractNestedErrorText = (source: unknown): string[] => {
  if (source === null || source === undefined) {
    return [];
  }
  if (isArray(source)) {
    return source.reduce<string[]>(
      (acc, item) => [...acc, ...extractNestedErrorText(item)],
      [],
    );
  }
  if (isString(source)) {
    return [source];
  }
  return Object.values(source as Record<string, unknown>).reduce<string[]>(
    (acc, item) => [...acc, ...extractNestedErrorText(item)],
    [],
  );
};

interface YoutubeLink {
  fullUrl: string;
  videoID: string | null;
  playlistID: string | null;
}

const parseYoutubeLink = (urlStr: string): YoutubeLink | null => {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch (error) {
    return null;
  }
  if (
    !["youtube.com", "youtu.be", "www.youtube.com", "www.youtu.be"].includes(
      url.hostname,
    )
  ) {
    return null;
  }
  let videoID = url.searchParams.get("v");
  const playlistID = url.searchParams.get("list");
  if (!videoID) {
    const match = url.pathname.match(/\/embed\/([^/]+)\/?/);
    if (match) {
      videoID = match[1];
    }
  }
  if (!videoID) {
    if (["youtu.be", "www.youtu.be"].includes(url.hostname)) {
      videoID = url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
  }
  return { fullUrl: urlStr, videoID, playlistID };
};

// The generated API client rejects with the parsed response body on HTTP
// errors (an object or string), or with a network Error otherwise.
const getResponseError = (error: unknown): Record<string, unknown> | null => {
  if (error && typeof error === "object" && !(error instanceof Error)) {
    return error as Record<string, unknown>;
  }
  return null;
};

const extractErrorMessage = (error: unknown) => {
  if (!error) {
    return null;
  }
  if (isString(error)) {
    return error;
  }
  const data = getResponseError(error);
  if (data === null) {
    return error instanceof Error ? error.message : "Unknown error";
  }
  if (isString(data)) {
    return data;
  }
  if (isString(data.detail)) {
    return data.detail;
  }
  const values = Object.values(data);
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

const resetQueries = async (
  queryClient: QueryClient,
  queryKeyPrefixes: string[],
  soft?: boolean | undefined,
): Promise<void> => {
  await Promise.all(
    queryKeyPrefixes.map((prefix) => {
      // React Query v5 takes a filters object rather than a bare key; a string
      // prefix maps to a partial queryKey match.
      const filters: QueryFilters = { queryKey: [prefix] };
      if (!soft) {
        queryClient
          .getQueryCache()
          .findAll(filters)
          .forEach((query) => query.setData(undefined));
      }
      return queryClient.invalidateQueries(filters);
    }),
  );
};

export {
  filterFalsyObjectValues,
  boolToSearchString,
  searchStringToBool,
  getGenericSearchQuery,
  getCurrentSearchParams,
  extractNestedErrorText,
  extractErrorMessage,
  getResponseError,
  parseYoutubeLink,
  showAlertOnError,
  resetQueries,
};
export type { YoutubeLink };
