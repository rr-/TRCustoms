import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { Config } from "src/services/ConfigService";
import { ConfigService } from "src/services/ConfigService";

interface ConfigContextProviderProps {
  children: React.ReactNode;
}

const defaultConfig = {
  countries: [],
  tags: [],
  genres: [],
  engines: [],
  durations: [],
  difficulties: [],
  review_questions: [],
  limits: {
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
    total_reviews: 0,
    total_downloads: 0,
    total_walkthroughs: 0,
    reviews: [],
    walkthroughs: {
      video_and_text: 0,
      video: 0,
      text: 0,
      none: 0,
    },
  },
};

const ConfigContext = createContext<{
  config: Config;
  refetchConfig: () => Promise<void>;
}>({ config: defaultConfig, refetchConfig: async () => {} });

const ConfigContextProvider = ({ children }: ConfigContextProviderProps) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  const refetchConfig = async () => {
    setConfig(await ConfigService.getConfig());
  };

  useEffect(() => {
    refetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, refetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigContextProvider, ConfigContext };
