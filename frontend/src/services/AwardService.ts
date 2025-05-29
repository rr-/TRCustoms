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

/**
 * Returns the URL for an award's image.
 */
const getArtifactImageSrc = (code: string, tier?: number): string =>
  tier && tier > 0 ? `/awards/${code}_${tier}.svg` : `/awards/${code}.svg`;

/**
 * Mapping of tier numbers to human-readable names
 */
const tierNames: { [tier: number]: string } = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Jade",
  5: "Meteorite",
};

const getTierNames = (): { [tier: number]: string } => {
  return tierNames;
};

const AwardService = {
  getAwardSpecs,
  searchAwardRecipients,
  getArtifactImageSrc,
  getTierNames,
};

export { AwardService };
