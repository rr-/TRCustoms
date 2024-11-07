import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface EngineNested {
  id: number;
  name: string;
}

interface EngineListing extends EngineNested {
  position: number;
  level_count: number;
  created: string;
  last_updated: string;
}

interface EngineSearchQuery extends GenericSearchQuery {}
interface EngineSearchResult
  extends GenericSearchResult<EngineSearchQuery, EngineListing> {}

const searchEngines = async (
  searchQuery: EngineSearchQuery
): Promise<EngineSearchResult> => {
  const params = getGenericSearchQuery(searchQuery);
  const response = (await api.get(`${API_URL}/level_engines/`, {
    params,
  })) as AxiosResponse<EngineSearchResult>;
  return { ...response.data, searchQuery };
};

const EngineService = {
  searchEngines,
};

export type {
  EngineNested,
  EngineListing,
  EngineSearchQuery,
  EngineSearchResult,
};

export { EngineService };
