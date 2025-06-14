import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UserNested } from "src/services/UserService";
import type { PagedResponse } from "src/types";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
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
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    level: searchQuery.level || null,
    user_search: searchQuery.userSearch || null,
    object_search: searchQuery.objectSearch || null,
    is_action_required: boolToSearchString(searchQuery.isActionRequired),
  });
  const response = (await api.get(`${API_URL}/auditlogs/`, {
    params,
  })) as AxiosResponse<AuditLogSearchResult>;
  return { ...response.data, searchQuery };
};

const approve = async (auditLogId: number): Promise<void> => {
  await api.post(`${API_URL}/auditlogs/${auditLogId}/approve/`);
};

const AuditLogService = {
  searchAuditLogs,
  approve,
};

export type {
  AuditLogListing,
  AuditLogList,
  AuditLogSearchQuery,
  AuditLogSearchResult,
};

export { AuditLogObjectType, AuditLogChangeType, AuditLogService };
