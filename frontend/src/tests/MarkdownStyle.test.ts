import assert from "node:assert/strict";
import { applyStyle } from "src/components/markdown-composer/MarkdownStyle";
import {
  isMultipleLines,
  makePrefix,
  repeat,
  undoOrderedListStyle,
  undoUnorderedListStyle,
  wordSelectionEnd,
  wordSelectionStart,
} from "src/components/markdown-composer/MarkdownStyle/text";
import { test } from "vitest";

test("undoOrderedListStyle strips numbering when all lines match", () => {
  const result = undoOrderedListStyle("1. a\n2. b");
  assert.equal(result.processed, true);
  assert.equal(result.text, "a\nb");
});

test("undoOrderedListStyle leaves mixed content untouched", () => {
  const result = undoOrderedListStyle("1. a\nb");
  assert.equal(result.processed, false);
  assert.equal(result.text, "1. a\nb");
});

test("undoUnorderedListStyle strips bullets", () => {
  const result = undoUnorderedListStyle("- a\n- b");
  assert.equal(result.processed, true);
  assert.equal(result.text, "a\nb");
});

test("makePrefix numbers ordered lists and bullets unordered", () => {
  assert.equal(makePrefix(0, false), "1. ");
  assert.equal(makePrefix(2, false), "3. ");
  assert.equal(makePrefix(0, true), "- ");
});

test("isMultipleLines detects multi-line text", () => {
  assert.equal(isMultipleLines("a\nb"), true);
  assert.equal(isMultipleLines("a"), false);
});

test("repeat repeats a string n times", () => {
  assert.equal(repeat("x", 3), "xxx");
});

test("word selection expands to word boundaries", () => {
  assert.equal(wordSelectionStart("foo bar", 5), 4);
  assert.equal(wordSelectionEnd("foo bar", 4, false), 7);
});

test("applyStyle wraps the selection with prefix and suffix", () => {
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.value = "hello";
  textarea.setSelectionRange(0, 5);

  applyStyle(textarea, { prefix: "**", suffix: "**" });

  assert.equal(textarea.value, "**hello**");
  textarea.remove();
});
