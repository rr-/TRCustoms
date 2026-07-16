import { validateEmail } from "src/utils/validation";
import { validateMaxLength } from "src/utils/validation";
import { validatePassword } from "src/utils/validation";
import { validatePassword2 } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";
import { validateURL } from "src/utils/validation";
import { validateUserName } from "src/utils/validation";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

describe("validateRequired", () => {
  test.each([["" as unknown], [undefined], [null], [[]]])(
    "rejects empty value %o",
    (value) => {
      expect(validateRequired(value)).toBe("This field is required");
    },
  );

  test.each([["x" as unknown], [["a"]], [0]])(
    "accepts non-empty value %o",
    (value) => {
      expect(validateRequired(value)).toBeNull();
    },
  );
});

describe("validateMaxLength", () => {
  test("rejects strings over the limit", () => {
    expect(validateMaxLength(5)("abcdef")).toBe(
      "This field must be at most 5 characters long",
    );
  });

  test("accepts strings at or under the limit", () => {
    expect(validateMaxLength(5)("abcde")).toBeNull();
  });

  test("ignores non-string values", () => {
    expect(validateMaxLength(5)(123456789 as unknown as string)).toBeNull();
  });
});

describe("validateEmail", () => {
  test("accepts an empty value (optional)", () => {
    expect(validateEmail("")).toBeNull();
  });

  test("rejects too-short values", () => {
    expect(validateEmail("a@")).toBe(
      "Email must be at least 3 characters long",
    );
  });

  test("rejects too-long values", () => {
    expect(validateEmail("a".repeat(70) + "@x.com")).toBe(
      "Email must be at most 64 characters long",
    );
  });

  test("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email")).toBe(
      "This address appears to be invalid",
    );
  });

  test("accepts a well-formed address", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });
});

describe("validateURL", () => {
  test("accepts an empty value (optional)", () => {
    expect(validateURL("")).toBeNull();
  });

  test("rejects a non-URL", () => {
    expect(validateURL("nonsense")).toBe(
      'Enter a valid URL, like "https://example.com/"',
    );
  });

  test("accepts a well-formed URL", () => {
    expect(validateURL("https://example.com/")).toBeNull();
  });
});

describe("validatePassword", () => {
  test("accepts an empty value (optional)", () => {
    expect(validatePassword("")).toBeNull();
  });

  test("rejects short passwords", () => {
    expect(validatePassword("abc123")).toBe(
      "Password must contain at least 7 characters",
    );
  });

  test("accepts a long-enough password", () => {
    expect(validatePassword("abc1234")).toBeNull();
  });
});

describe("validatePassword2", () => {
  test("accepts matching passwords", () => {
    expect(validatePassword2("secret1", "secret1")).toBeNull();
  });

  test("accepts two empty passwords", () => {
    expect(validatePassword2("", "")).toBeNull();
  });

  test("rejects a mismatch", () => {
    expect(validatePassword2("secret1", "secret2")).toBe(
      "Passwords do not match",
    );
  });
});

describe("validateUserName", () => {
  test("accepts an empty value (optional)", () => {
    expect(validateUserName("")).toBeNull();
  });

  test("rejects names under 2 characters", () => {
    expect(validateUserName("a")).toBe(
      "Username must be at least 2 characters long",
    );
  });

  test("rejects names over 26 characters", () => {
    expect(validateUserName("a".repeat(27))).toBe(
      "Username must be at most 26 characters long",
    );
  });

  test("rejects names with no alphanumeric character", () => {
    expect(validateUserName("!!!")).toBe(
      "Username must contain at least one alphanumeric letter.",
    );
  });

  test("rejects names with disallowed characters", () => {
    expect(validateUserName("bad name")).toMatch(/can only contain/);
  });

  test("accepts a valid name", () => {
    expect(validateUserName("valid_name")).toBeNull();
  });
});
