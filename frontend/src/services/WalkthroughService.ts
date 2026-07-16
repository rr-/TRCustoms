import {
  walkthroughsApproveCreate,
  walkthroughsCreate,
  walkthroughsDestroy,
  walkthroughsList,
  walkthroughsPartialUpdate,
  walkthroughsPublishCreate,
  walkthroughsRejectCreate,
  walkthroughsRetrieve,
} from "src/client";
import type { WalkthroughDetails, WalkthroughListing } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

enum WalkthroughType {
  Link = "l",
  Text = "t",
}

enum WalkthroughStatus {
  Draft = "dra",
  PendingApproval = "pen",
  Approved = "app",
  Rejected = "rej",
}

interface WalkthroughCreatePayload {
  levelId: number;
  walkthroughType: WalkthroughType;
  text: string;
}

interface WalkthroughUpdatePayload {
  text: string;
}

interface WalkthroughSearchQuery extends GenericSearchQuery {
  levels?: Array<number> | undefined;
  authors?: Array<number> | undefined;
  walkthroughType?: WalkthroughType | undefined;
  isApproved?: boolean | null;
}

interface WalkthroughSearchResult
  extends GenericSearchResult<WalkthroughSearchQuery, WalkthroughListing> {}

const searchWalkthroughs = async (
  searchQuery: WalkthroughSearchQuery,
): Promise<WalkthroughSearchResult> => {
  const query: Record<string, string | number | null | undefined> = {
    ...getGenericSearchQuery(searchQuery),
    walkthrough_type: searchQuery.walkthroughType || undefined,
    levels: searchQuery.levels?.join(",") || undefined,
    authors: searchQuery.authors?.join(",") || undefined,
    is_approved:
      searchQuery.isApproved == null
        ? undefined
        : searchQuery.isApproved
          ? "1"
          : "0",
  };
  const { data } = await walkthroughsList({ query, throwOnError: true });
  const results =
    searchQuery.sort === "random" ? shuffle(data.results) : data.results;
  return { ...data, results, searchQuery };
};

// Fisher-Yates: an unbiased shuffle (sort(() => Math.random() - 0.5) is not).
// Note this only randomises the current page; true cross-page randomness would
// have to come from the backend.
const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const getWalkthroughById = async (
  walkthroughId: number,
): Promise<WalkthroughDetails> => {
  const { data } = await walkthroughsRetrieve({
    path: { id: walkthroughId },
    throwOnError: true,
  });
  return data;
};

const create = async ({
  levelId,
  walkthroughType,
  text,
}: WalkthroughCreatePayload): Promise<WalkthroughDetails> => {
  const { data } = await walkthroughsCreate({
    body: {
      level_id: levelId,
      walkthrough_type: walkthroughType,
      text,
    },
    throwOnError: true,
  });
  return data;
};

const update = async (
  walkthroughId: number,
  { text }: WalkthroughUpdatePayload,
): Promise<WalkthroughDetails> => {
  const { data } = await walkthroughsPartialUpdate({
    path: { id: walkthroughId },
    body: { text },
    throwOnError: true,
  });
  return data;
};

const approve = async (walkthroughId: number): Promise<void> => {
  await walkthroughsApproveCreate({
    path: { id: walkthroughId },
    throwOnError: true,
  });
};

const reject = async (walkthroughId: number, reason: string): Promise<void> => {
  await walkthroughsRejectCreate({
    path: { id: walkthroughId },
    body: { reason },
    throwOnError: true,
  });
};

const deleteWalkthrough = async (walkthroughId: number): Promise<void> => {
  await walkthroughsDestroy({
    path: { id: walkthroughId },
    throwOnError: true,
  });
};

const publish = async (walkthroughId: number): Promise<void> => {
  await walkthroughsPublishCreate({
    path: { id: walkthroughId },
    throwOnError: true,
  });
};

const WalkthroughService = {
  searchWalkthroughs,
  getWalkthroughById,
  create,
  update,
  approve,
  reject,
  delete: deleteWalkthrough,
  publish,
};

export type {
  WalkthroughDetails,
  WalkthroughListing,
  WalkthroughSearchQuery,
  WalkthroughSearchResult,
};

export { WalkthroughStatus, WalkthroughType, WalkthroughService };
