import { round } from "lodash";

const EMPTY_INPUT_PLACEHOLDER = "-";

const reprBigNumber = (num: number): string => {
  const suffixes = ["", "k", "m"];
  let suffix = suffixes.shift();
  while (suffixes.length && num >= 1000) {
    num /= 1000;
    suffix = suffixes.shift();
  }
  return `${round(num, 1)}${suffix}`;
};

const titleCase = (input: string): string => {
  let sentences = input.split(/\. /);
  return sentences
    .map((sentence) => sentence[0].toUpperCase() + sentence.substr(1))
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
  return date
    .toLocaleString("en-GB", {
      day: "numeric",
      year: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(/,/, "");
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

const pluralize = (noun: string, count: number) => {
  if (noun === "media") {
    return "media";
  }
  return count === 1 ? noun : `${noun}s`;
};

export {
  EMPTY_INPUT_PLACEHOLDER,
  pluralize,
  titleCase,
  makeSentence,
  formatDate,
  formatDateTime,
  formatFileSize,
  reprBigNumber,
};
