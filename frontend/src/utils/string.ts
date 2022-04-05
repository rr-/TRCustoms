import { round } from "lodash";

const reprBigNumber = (num: number): string => {
  const suffixes = ["", "k", "m"];
  let suffix = suffixes.shift();
  while (suffixes.length && num >= 1000) {
    num /= 1000;
    suffix = suffixes.shift();
  }
  return `${round(num, 1)}${suffix}`;
};

export { reprBigNumber };
