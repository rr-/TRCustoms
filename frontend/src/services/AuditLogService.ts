import { auditlogsList } from "src/client";
import type { UserNested } from "src/services/UserService";
import type { PagedResponse } from "src/types";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";
import { boolToSearchString } from "src/utils/misc";

enum AuditLogChangeType {
  Update = "UPDATE",
  Create = "CREATE",
  Delete = "DELETE",
}

enum AuditLogObjectType {
  Engine = "engine",
  Level = "level",
  LevelDifficulty = "leveldifficulty",
  LevelDuration = "levelduration",
  LevelGenre = "levelgenre",
  LevelReviewLegacy = "levelreview",
  LevelReview = "review",
  Tag = "tag",
  News = "news",
  Rating = "rating",
  User = "user",
  Walkthrough = "walkthrough",
}

interface AuditLogListing {
  id: number;
  created: string;
  object_id: string;
  object_name: string;
  object_type: AuditLogObjectType;
  change_author: UserNested | null;
  change_type: AuditLogChangeType;
  meta: any;
  changes: string[];
  is_action_required: boolean;
}

interface AuditLogList extends PagedResponse<AuditLogListing> {}

interface AuditLogSearchQuery extends GenericSearchQuery {
  level?: number | undefined;
  isActionRequired?: boolean | null;
  userSearch?: string | undefined;
  objectSearch?: string | undefined;
}

interface AuditLogSearchResult
  extends GenericSearchResult<AuditLogSearchQuery, AuditLogListing> {}

const searchAuditLogs = async (
  searchQuery: AuditLogSearchQuery,
): Promise<AuditLogSearchResult> => {
  const query: { [key: string]: any } = {
    ...getGenericSearchQuery(searchQuery),
    level: searchQuery.level || undefined,
    user_search: searchQuery.userSearch || undefined,
    object_search: searchQuery.objectSearch || undefined,
    is_action_required: boolToSearchString(searchQuery.isActionRequired),
  };
  const { data } = await auditlogsList({ query, throwOnError: true });
  // The audit log's change list and meta are loosely typed in the schema.
  return { ...data, searchQuery } as unknown as AuditLogSearchResult;
};

const AuditLogService = {
  searchAuditLogs,
};

export type {
  AuditLogListing,
  AuditLogList,
  AuditLogSearchQuery,
  AuditLogSearchResult,
};

export { AuditLogObjectType, AuditLogChangeType, AuditLogService };
