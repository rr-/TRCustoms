import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";

/**
 * Represents a specification for an award available to users.
 */
export interface AwardSpec {
  code: string;
  title: string;
  description: string;
  guide_description: string;
  tier: number;
  can_be_removed: boolean;
  rarity: number;
}

/**
 * Fetches all award specifications from the backend.
 */
const getAwardSpecs = async (): Promise<AwardSpec[]> => {
  const response = (await api.get(`${API_URL}/award_specs/`)) as AxiosResponse<
    AwardSpec[]
  >;
  return response.data;
};

const AwardService = {
  getAwardSpecs,
};

export { AwardService };
