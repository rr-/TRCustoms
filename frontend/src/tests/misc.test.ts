import { boolToSearchString } from "src/utils/misc";
import { extractErrorMessage } from "src/utils/misc";
import { extractNestedErrorText } from "src/utils/misc";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";
import { getResponseError } from "src/utils/misc";
import { parseYoutubeLink } from "src/utils/misc";
import { searchStringToBool } from "src/utils/misc";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

describe("boolToSearchString / searchStringToBool", () => {
  test("maps booleans to the API's 1/0/undefined strings", () => {
    expect(boolToSearchString(true)).toBe("1");
    expect(boolToSearchString(false)).toBe("0");
    expect(boolToSearchString(null)).toBe(null);
    expect(boolToSearchString(undefined)).toBe(null);
  });

  test("round-trips back to booleans", () => {
    expect(searchStringToBool("1")).toBe(true);
    expect(searchStringToBool("0")).toBe(false);
    expect(searchStringToBool("")).toBe(null);
    expect(searchStringToBool(undefined)).toBe(null);
  });
});

describe("filterFalsyObjectValues", () => {
  test("drops falsy values", () => {
    expect(
      filterFalsyObjectValues({
        a: 1,
        b: 0,
        c: "x",
        d: null,
        e: "",
      }),
    ).toEqual({ a: 1, c: "x" });
  });
});

describe("getGenericSearchQuery", () => {
  test("stringifies the page and passes the rest through", () => {
    expect(
      getGenericSearchQuery({
        page: 2,
        pageSize: 10,
        sort: "name",
        search: "q",
      }),
    ).toEqual({ page: "2", page_size: 10, sort: "name", search: "q" });
  });

  test("omits falsy fields", () => {
    expect(getGenericSearchQuery({})).toEqual({});
  });
});

describe("parseYoutubeLink", () => {
  test("extracts the video id from a watch URL", () => {
    expect(parseYoutubeLink("https://www.youtube.com/watch?v=abc123")).toEqual({
      fullUrl: "https://www.youtube.com/watch?v=abc123",
      videoID: "abc123",
      playlistID: null,
    });
  });

  test("extracts the video id from a youtu.be short URL", () => {
    expect(parseYoutubeLink("https://youtu.be/xyz")?.videoID).toBe("xyz");
  });

  test("extracts the video id from an embed URL", () => {
    expect(parseYoutubeLink("https://youtube.com/embed/emb123")?.videoID).toBe(
      "emb123",
    );
  });

  test("reads the playlist id", () => {
    expect(
      parseYoutubeLink("https://www.youtube.com/watch?v=a&list=PL123")
        ?.playlistID,
    ).toBe("PL123");
  });

  test("returns null for non-YouTube and invalid URLs", () => {
    expect(parseYoutubeLink("https://example.com")).toBe(null);
    expect(parseYoutubeLink("not a url")).toBe(null);
  });
});

describe("getResponseError", () => {
  test("returns object bodies and null for Errors / primitives", () => {
    const body = { detail: "boom" };
    expect(getResponseError(body)).toBe(body);
    expect(getResponseError(new Error("net"))).toBe(null);
    expect(getResponseError("nope")).toBe(null);
  });
});

describe("extractNestedErrorText", () => {
  test("flattens nested strings and arrays", () => {
    expect(extractNestedErrorText({ a: "x", b: ["y", "z"] })).toEqual([
      "x",
      "y",
      "z",
    ]);
    expect(extractNestedErrorText("s")).toEqual(["s"]);
    expect(extractNestedErrorText(null)).toEqual([]);
  });
});

describe("extractErrorMessage", () => {
  test("handles strings, DRF detail, field errors and Errors", () => {
    expect(extractErrorMessage("boom")).toBe("boom");
    expect(extractErrorMessage({ detail: "nope" })).toBe("nope");
    expect(extractErrorMessage({ field: ["bad"] })).toBe("bad");
    expect(extractErrorMessage(new Error("net"))).toBe("net");
    expect(extractErrorMessage(null)).toBe(null);
  });
});
