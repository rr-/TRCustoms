import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { Config } from "src/services/config.service";
import { ConfigService } from "src/services/config.service";

interface ConfigContextProviderProps {
  children: React.ReactNode;
}

const defaultConfig = {
  tags: [],
  genres: [],
  engines: [],
  durations: [],
  difficulties: [],
  limits: {
    min_tags: 0,
    max_tags: 0,
    min_genres: 0,
    max_genres: 0,
    min_screenshots: 0,
    max_screenshots: 0,
    min_authors: 0,
    max_authors: 0,
  },
};

const ConfigContext = createContext<Config>(defaultConfig);

const ConfigContextProvider = ({ children }: ConfigContextProviderProps) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    const fetchUser = async () => {
      setConfig(await ConfigService.getConfig());
    };

    fetchUser();
  }, [setConfig]);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export { ConfigContextProvider, ConfigContext };