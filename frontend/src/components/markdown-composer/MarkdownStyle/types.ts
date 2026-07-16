interface MarkdownStyle {
  prefix: string;
  suffix: string;
  blockPrefix: string;
  blockSuffix: string;
  multiline: boolean;
  replaceNext: string;
  prefixSpace: boolean;
  scanFor: string;
  surroundWithNewlines: boolean;
  orderedList: boolean;
  unorderedList: boolean;
  trimFirst: boolean;
}

interface MarkdownInputStyle {
  prefix?: string | undefined;
  suffix?: string | undefined;
  blockPrefix?: string | undefined;
  blockSuffix?: string | undefined;
  multiline?: boolean | undefined;
  replaceNext?: string | undefined;
  prefixSpace?: boolean | undefined;
  scanFor?: string | undefined;
  surroundWithNewlines?: boolean | undefined;
  orderedList?: boolean | undefined;
  unorderedList?: boolean | undefined;
  trimFirst?: boolean | undefined;
}

interface MarkdownSelection {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

interface MarkdownListResult {
  text: string;
  processed: boolean;
}

export type {
  MarkdownStyle,
  MarkdownInputStyle,
  MarkdownSelection,
  MarkdownListResult,
};
