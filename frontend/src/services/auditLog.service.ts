import { AxiosResponse } from "axios";
import type { UserNested } from "src/services/user.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { PagedResponse } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

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
  reviewer: UserNested | null;
  changes: string[];
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
