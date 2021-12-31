import { DISABLE_PAGING } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";

const EMPTY_INPUT_PLACEHOLDER = "-";

function getGenericSearchQuery(
  searchQuery: GenericSearchQuery
): { [key: string]: string } {
  return filterFalsyObjectValues({
    page:
      searchQuery.page && searchQuery.page !== DISABLE_PAGING
        ? `${searchQuery.page}`
        : null,
    sort: searchQuery.sort,
    search: searchQuery.search,
    disable_paging: searchQuery.page === DISABLE_PAGING ? "1" : null,
  });
}

const validateRequired = (value: string): string | null => {
  if (!value) {
    return "Required";
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
  } else if (username.length < 3) {
    return "Username must be at least 3 characters long";
  } else if (username.length > 26) {
    return "Username must be at most 26 characters long";
  } else if (!/^[A-Z0-9._+-]+$/i.test(username)) {
    return "Username can only contain alphanumeric letters and the following special characters: . _ + -";
  }
  return null;
};

const makeSentence = (input: string): string => {
  return input[0].toUpperCase() + input.substr(1).replace(/\.$/, "") + ".";
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

const filterFalsyObjectValues = <T extends Object>(source: T): T => {
  return Object.fromEntries(
    Object.entries(source).filter(([_key, value]) => !!value)
  ) as T;
};

export {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePassword2,
  validateUserName,
  makeSentence,
  formatDate,
  formatDateTime,
  formatFileSize,
  filterFalsyObjectValues,
  getGenericSearchQuery,
  EMPTY_INPUT_PLACEHOLDER,
};
