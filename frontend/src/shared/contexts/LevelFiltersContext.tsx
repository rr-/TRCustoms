import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { LevelFilters } from "src/services/level.service";
import { LevelService } from "src/services/level.service";

const LevelFiltersContext = createContext<any>(null);

const LevelFiltersContextProvider = ({ children }: { children: any }) => {
  const [levelFilters, setLevelFilters] = useState<LevelFilters>({
    tags: [],
    genres: [],
    engines: [],
    durations: [],
    difficulties: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLevelFilters(await LevelService.getLevelFilters());
    };

    fetchUser();
  }, [setLevelFilters]);

  return (
    <LevelFiltersContext.Provider value={{ levelFilters, setLevelFilters }}>
      {children}
    </LevelFiltersContext.Provider>
  );
};

export { LevelFiltersContextProvider, LevelFiltersContext };
