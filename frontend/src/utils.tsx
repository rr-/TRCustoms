import axios from "axios";
import { AxiosError } from "axios";
import { isString } from "lodash";
import { isArray } from "lodash";
import { DISABLE_PAGING } from "src/constants";
import type { GenericSearchQuery } from "src/types";

const EMPTY_INPUT_PLACEHOLDER = "-";

const getGenericSearchQuery = (
  searchQuery: GenericSearchQuery
): { [key: string]: any } => {
  return filterFalsyObjectValues({
    page:
      searchQuery.page && searchQuery.page !== DISABLE_PAGING
        ? `${searchQuery.page}`
        : null,
    sort: searchQuery.sort,
    search: searchQuery.search,
    disable_paging: searchQuery.page === DISABLE_PAGING ? "1" : null,
  });
};

const getCurrentSearchParams = (): { [key: string]: string } => {
  return Object.fromEntries(new URL(window.location.href).searchParams);
};

const validateRequired = (value: any): string | null => {
  if (
    value === "" ||
    value === undefined ||
    value === null ||
    value?.length === 0
  ) {
    return "This field is required";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) {
    return null;
  } else if (email.length < 3) {
    return "Email must be at least 3 characters long";
  } else if (email.length > 64) {
    return "Email must be at most 64 characters long";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return "This address appears to be invalid";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return null;
  } else if (password.length < 7) {
    return "Password must contain at least 7 characters";
  }
  return null;
};

const validatePassword2 = (
  password: string,
  password2: string
): string | null => {
  if ((password || password2) && password !== password2) {
    return "Passwords do not match";
  }
  return null;
};

const validateUserName = (username: string): string | null => {
  if (!username) {
    return null;
  } else if (username.length < 2) {
    return "Username must be at least 2 characters long";
  } else if (username.length > 26) {
    return "Username must be at most 26 characters long";
  } else if (!/^[A-Z0-9!@#$%^&*()_+={}[\]:";',.-]+$/i.test(username)) {
    return "Username can only contain alphanumeric letters and the following special characters: ! @ # $ % ^ & * ( ) _ - + = { } [ ] : \" ; ' , .";
  }
  return null;
};

const titleCase = (input: string): string => {
  let sentences = input.split(/\. /);
  return sentences
    .map(
      (sentence) => sentence[0].toUpperCase() + sentence.substr(1).toLowerCase()
    )
    .join(". ");
};

const makeSentence = (input: string): string => {
  return titleCase(input).replace(/\.$/, "") + ".";
};

const formatDate = (input: string | null): string => {
  if (!input) {
    return EMPTY_INPUT_PLACEHOLDER;
  }
  const date = new Date(input);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    year: "numeric",
    month: "short",
  });
};

const formatDateTime = (input: string | null): string => {
  if (!input) {
    return EMPTY_INPUT_PLACEHOLDER;
  }
  const date = new Date(input);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    year: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

const formatFileSize = (input: number | null): string => {
  if (!input) {
    return EMPTY_INPUT_PLACEHOLDER;
  }
  const suffixes = ["B", "KB", "MB", "GB"];
  let suffix = suffixes.shift();
  let value = input;
  let base = 1024.0;
  while (value >= base && suffixes.length) {
    value /= base;
    suffix = suffixes.shift();
  }
  return `${Math.round(value * 100) / 100} ${suffix}`;
};

const filterFalsyObjectValues = <T extends any>(source: {
  [key: string]: T | null;
}): { [key: string]: T } => {
  return Object.fromEntries(
    Object.entries(source).filter(([_key, value]) => !!value)
  ) as { [key: string]: T };
};

const pluralize = (noun: string, count: number) => {
  return count === 1 ? noun : `${noun}s`;
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

const getYoutubeVideoID = (url: string): string | null => {
  let regExp = /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:v\/|\/u\/\w\/|embed\/|watch\?)?\??(?:v=)?([^#&?]*).*/;
  let match = url.match(regExp);
  return match ? match[1] : null;
};

const extractErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error;
  }
  const axiosError = error as AxiosError;
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
    alert(extractErrorMessage(error));
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
  pluralize,
  validateRequired,
  validateEmail,
  validatePassword,
  validatePassword2,
  validateUserName,
  titleCase,
  makeSentence,
  formatDate,
  formatDateTime,
  formatFileSize,
  filterFalsyObjectValues,
  getGenericSearchQuery,
  getCurrentSearchParams,
  extractNestedErrorText,
  getYoutubeVideoID,
  EMPTY_INPUT_PLACEHOLDER,
  extractErrorMessage,
  showAlertOnError,
  resetQueries,
};
