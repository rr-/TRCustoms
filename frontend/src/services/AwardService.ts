import { awardSpecsList, awardSpecsRecipientsList } from "src/client";
import type { AwardRecipient, AwardSpec } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

/**
 * Fetches all award specifications from the backend.
 */
const getAwardSpecs = async (): Promise<AwardSpec[]> => {
  const { data } = await awardSpecsList({ throwOnError: true });
  return data;
};

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
  const query: Record<string, string | number | null | undefined> = {
    ...getGenericSearchQuery(genericQuery),
    tier: tier ?? undefined,
  };
  const { data } = await awardSpecsRecipientsList({
    path: { code },
    query,
    throwOnError: true,
  });
  return { ...data, searchQuery };
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

export type { AwardSpec, AwardRecipient };
export { AwardService };
