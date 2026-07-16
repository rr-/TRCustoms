import { auditlogsList } from "src/client";
import type { AuditLogListing as ApiAuditLogListing } from "src/client";
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

// Anchored to the generated listing so the shared fields (id, object_id,
// object_name, ...) can't drift; only the fields the schema types loosely
// (object_type as a bare string, changes/meta as unknown) or nullably are
// refined here.
interface AuditLogListing
  extends Omit<
    ApiAuditLogListing,
    | "created"
    | "object_type"
    | "change_author"
    | "change_type"
    | "changes"
    | "meta"
  > {
  created: string;
  object_type: AuditLogObjectType;
  change_author: UserNested | null;
  change_type: AuditLogChangeType;
  changes: string[];
  meta: Record<string, string>;
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
  const query: Record<string, string | number | null | undefined> = {
    ...getGenericSearchQuery(searchQuery),
    level: searchQuery.level || undefined,
    user_search: searchQuery.userSearch || undefined,
    object_search: searchQuery.objectSearch || undefined,
    is_action_required: boolToSearchString(searchQuery.isActionRequired),
  };
  const { data } = await auditlogsList({ query, throwOnError: true });
  return {
    ...data,
    // Refine the loosely-typed fields per row rather than casting the whole
    // array through unknown.
    results: data.results.map(
      (row): AuditLogListing => ({
        ...row,
        created: row.created ?? "",
        object_type: row.object_type as AuditLogObjectType,
        change_type: row.change_type as AuditLogChangeType,
        changes: row.changes as string[],
        meta: row.meta as Record<string, string>,
      }),
    ),
    searchQuery,
  };
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
