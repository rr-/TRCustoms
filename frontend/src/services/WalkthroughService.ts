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
  const query: { [key: string]: any } = {
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
    searchQuery.sort === "random"
      ? [...data.results].sort(() => Math.random() - 0.5)
      : data.results;
  return { ...data, results, searchQuery };
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
}: WalkthroughCreatePayload): Promise<WalkthroughListing> => {
  const { data } = await walkthroughsCreate({
    body: {
      level_id: levelId,
      walkthrough_type: walkthroughType,
      text,
    } as any,
    throwOnError: true,
  });
  return data;
};

const update = async (
  walkthroughId: number,
  { text }: WalkthroughUpdatePayload,
): Promise<WalkthroughListing> => {
  const { data } = await walkthroughsPartialUpdate({
    path: { id: walkthroughId },
    body: { text } as any,
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
    body: { reason } as any,
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
