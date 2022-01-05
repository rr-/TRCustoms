import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { PagedResponse } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

interface Engine {
  id: number;
  name: string;
  level_count: number;
  created: string;
  last_updated: string;
}

interface EngineSearchQuery extends GenericSearchQuery {}
interface EngineList extends PagedResponse<Engine> {}
interface EngineSearchResult
  extends GenericSearchResult<EngineSearchQuery, Engine> {}

const searchEngines = async (
  searchQuery: EngineSearchQuery
): Promise<EngineSearchResult | null> => {
  const result = await fetchJSON<EngineList>(`${API_URL}/level_engines/`, {
    query: getGenericSearchQuery(searchQuery),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const EngineService = {
  searchEngines,
};

export type { Engine, EngineList, EngineSearchQuery, EngineSearchResult };

export { EngineService };