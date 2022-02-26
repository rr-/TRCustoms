import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { UserNested } from "src/services/UserService";
import type { PagedResponse } from "src/types";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils";
import { getGenericSearchQuery } from "src/utils";

enum AuditLogChangeType {
  Update = "UPDATE",
  Create = "CREATE",
  Delete = "DELETE",
}

enum AuditLogObjectType {
  Level = "level",
  LevelEngine = "levelengine",
  LevelGenre = "levelgenre",
  LevelTag = "leveltag",
  LevelDuration = "levelduration",
  LevelDifficulty = "leveldifficulty",
  LevelReview = "levelreview",
  User = "user",
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
  isReviewed?: boolean | undefined;
}

interface AuditLogSearchResult
  extends GenericSearchResult<AuditLogSearchQuery, AuditLogListing> {}

const searchAuditLogs = async (
  searchQuery: AuditLogSearchQuery
): Promise<AuditLogSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    level: searchQuery.level || null,
    is_reviewed:
      searchQuery.isReviewed === true
        ? "1"
        : searchQuery.isReviewed === false
        ? "0"
        : false,
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
