import { formatDate } from "src/utils/string";
import { formatFileSize } from "src/utils/string";
import { makeSentence } from "src/utils/string";
import { pluralize } from "src/utils/string";
import { reprBigNumber } from "src/utils/string";
import { reprPercentage } from "src/utils/string";
import { titleCase } from "src/utils/string";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

describe("reprBigNumber", () => {
  test("leaves numbers below 1000 alone", () => {
    expect(reprBigNumber(999)).toBe("999");
  });

  test("abbreviates thousands and millions", () => {
    expect(reprBigNumber(1500)).toBe("1.5k");
    expect(reprBigNumber(1_500_000)).toBe("1.5m");
  });
});

describe("reprPercentage", () => {
  test("scales a fraction to a percentage", () => {
    expect(reprPercentage(0.5)).toBe("50%");
    expect(reprPercentage(0.333)).toBe("33.3%");
  });
});

describe("titleCase / makeSentence", () => {
  test("titleCase capitalises each sentence", () => {
    expect(titleCase("hello. world")).toBe("Hello. World");
  });

  test("makeSentence capitalises and ends with a single period", () => {
    expect(makeSentence("hello world")).toBe("Hello world.");
    expect(makeSentence("hello world.")).toBe("Hello world.");
  });
});

describe("formatFileSize", () => {
  test("returns the placeholder for empty input", () => {
    expect(formatFileSize(null)).toBe("-");
    expect(formatFileSize(0)).toBe("-");
  });

  test("scales through the binary suffixes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
  });
});

describe("pluralize", () => {
  test("pluralises based on count", () => {
    expect(pluralize("cat", 1)).toBe("cat");
    expect(pluralize("cat", 2)).toBe("cats");
  });

  test("leaves the mass noun 'media' unchanged", () => {
    expect(pluralize("media", 5)).toBe("media");
  });
});

describe("formatDate", () => {
  test("returns the placeholder for null", () => {
    expect(formatDate(null)).toBe("-");
  });
});
