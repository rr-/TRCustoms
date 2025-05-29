import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery, filterFalsyObjectValues } from "src/utils/misc";

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

/**
 * Represents a single award recipient entry.
 */
export interface AwardRecipient {
  user: UserNested;
  created: string;
}

/**
 * Search for award recipients with pagination (supported by backend CustomPagination).
 */
export interface AwardRecipientsSearchQuery extends GenericSearchQuery {
  code: string;
  tier?: number;
}

export interface AwardRecipientsSearchResult
  extends GenericSearchResult<AwardRecipientsSearchQuery, AwardRecipient> {}

const searchAwardRecipients = async (
  searchQuery: AwardRecipientsSearchQuery,
): Promise<AwardRecipientsSearchResult> => {
  const { code, tier, ...genericQuery } = searchQuery;
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(genericQuery),
    tier: tier != null ? `${tier}` : null,
  });
  const response = (await api.get(
    `${API_URL}/award_specs/${code}/recipients/`,
    { params },
  )) as AxiosResponse<AwardRecipientsSearchResult>;
  return { ...response.data, searchQuery };
};

const AwardService = {
  getAwardSpecs,
  searchAwardRecipients,
};

export { AwardService };
