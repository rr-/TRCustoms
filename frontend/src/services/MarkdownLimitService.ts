import type { Config } from "src/services/ConfigService";

type MarkdownLimitKey = keyof Config["limits"]["markdown_fields"];

interface MarkdownLimitState {
  currentLength: number;
  limit: number;
  isOverLimit: boolean;
  shouldDisplay: boolean;
}

const COUNTER_VISIBILITY_THRESHOLD = 0.75;

const getMarkdownLimit = (
  config: Config,
  key: MarkdownLimitKey | undefined,
): number | null => {
  if (!key) {
    return null;
  }
  return config.limits.markdown_fields[key];
};

const getMarkdownLimitState = (
  text: string,
  limit: number | null,
): MarkdownLimitState | null => {
  if (limit === null) {
    return null;
  }

  const currentLength = text.length;
  return {
    currentLength,
    limit,
    isOverLimit: currentLength > limit,
    shouldDisplay: currentLength / limit >= COUNTER_VISIBILITY_THRESHOLD,
  };
};

export type { MarkdownLimitKey, MarkdownLimitState };
export {
  COUNTER_VISIBILITY_THRESHOLD,
  getMarkdownLimit,
  getMarkdownLimitState,
};
