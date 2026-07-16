import type { MarkdownListResult } from "./types";
import type { MarkdownStyle } from "./types";

// Pure string helpers behind the markdown toolbar: no DOM, so they are the
// unit-testable core of the formatting engine. The textarea-bound operations
// that call them live in index.ts.

const isMultipleLines = (text: string): boolean => {
  return text.trim().split("\n").length > 1;
};

const repeat = (text: string, n: number): string => {
  return Array(n + 1).join(text);
};

const wordSelectionStart = (text: string, i: number): number => {
  let index = i;
  while (
    text[index] &&
    text[index - 1] != null &&
    !text[index - 1].match(/\s/)
  ) {
    index--;
  }
  return index;
};

const wordSelectionEnd = (
  text: string,
  i: number,
  multiline: boolean,
): number => {
  let index = i;
  const breakpoint = multiline ? /\n/ : /\s/;
  while (text[index] && !text[index].match(breakpoint)) {
    index++;
  }
  return index;
};

const undoOrderedListStyle = (text: string): MarkdownListResult => {
  const lines = text.split("\n");
  const orderedListRegex = /^\d+\.\s+/;
  const shouldUndoOrderedList = lines.every((line) =>
    orderedListRegex.test(line),
  );
  let result = lines;
  if (shouldUndoOrderedList) {
    result = lines.map((line) => line.replace(orderedListRegex, ""));
  }
  return {
    text: result.join("\n"),
    processed: shouldUndoOrderedList,
  };
};

const undoUnorderedListStyle = (text: string): MarkdownListResult => {
  const lines = text.split("\n");
  const unorderedListPrefix = "- ";
  const shouldUndoUnorderedList = lines.every((line) =>
    line.startsWith(unorderedListPrefix),
  );
  let result = lines;
  if (shouldUndoUnorderedList) {
    result = lines.map((line) =>
      line.slice(unorderedListPrefix.length, line.length),
    );
  }
  return {
    text: result.join("\n"),
    processed: shouldUndoUnorderedList,
  };
};

const makePrefix = (index: number, unorderedList: boolean): string => {
  if (unorderedList) {
    return "- ";
  } else {
    return `${index + 1}. `;
  }
};

const clearExistingListStyle = (
  style: MarkdownStyle,
  selectedText: string,
): [MarkdownListResult, MarkdownListResult, string] => {
  let undoResultOpositeList;
  let undoResult: MarkdownListResult;
  let pristineText;
  if (style.orderedList) {
    undoResult = undoOrderedListStyle(selectedText);
    undoResultOpositeList = undoUnorderedListStyle(undoResult.text);
    pristineText = undoResultOpositeList.text;
  } else {
    undoResult = undoUnorderedListStyle(selectedText);
    undoResultOpositeList = undoOrderedListStyle(undoResult.text);
    pristineText = undoResultOpositeList.text;
  }
  return [undoResult, undoResultOpositeList, pristineText];
};

export {
  isMultipleLines,
  repeat,
  wordSelectionStart,
  wordSelectionEnd,
  undoOrderedListStyle,
  undoUnorderedListStyle,
  makePrefix,
  clearExistingListStyle,
};
