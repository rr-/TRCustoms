import type { Config } from "src/services/ConfigService";
import { ConfigService } from "src/services/ConfigService";
import { create } from "zustand";

const defaultConfig: Config = {
  countries: [],
  tags: [],
  genres: [],
  engines: [],
  durations: [],
  difficulties: [],
  rating_questions: [],
  limits: {
    markdown_fields: {
      review_text: null,
      level_description: null,
      user_bio: null,
      news_text: null,
      walkthrough_text: null,
    },
    min_tags: 0,
    max_tags: 0,
    min_genres: 0,
    max_genres: 0,
    min_screenshots: 0,
    max_screenshots: 0,
    min_showcase_links: 0,
    max_showcase_links: 0,
    min_authors: 0,
    max_authors: 0,
    max_tag_length: 0,
  },
  stats: {
    total_levels: 0,
    total_ratings: 0,
    total_reviews: 0,
    total_downloads: 0,
    total_walkthroughs: 0,
    ratings: [],
    walkthroughs: {
      video_and_text: 0,
      video: 0,
      text: 0,
      none: 0,
    },
  },
  global_message: null,
};

interface ConfigState {
  config: Config;
  refetchConfig: () => Promise<void>;
}

const useConfig = create<ConfigState>((set) => ({
  config: defaultConfig,

  refetchConfig: async (): Promise<void> => {
    try {
      set({ config: await ConfigService.getConfig() });
    } catch (error) {
      // Keep the last-known (or default) config rather than letting an
      // unhandled rejection escape; the app degrades to empty tags/genres.
      console.error("Failed to load site config", error);
    }
  },
}));

export type { ConfigState };
export { useConfig, defaultConfig };
