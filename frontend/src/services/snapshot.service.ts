import { AxiosResponse } from "axios";
import type { UserNested } from "src/services/user.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { PagedResponse } from "src/shared/types";
import type { GenericSearchQuery } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getGenericSearchQuery } from "src/shared/utils";

enum DiffType {
  Added = 1,
  Deleted = 2,
  Updated = 3,
}

interface DiffItem {
  diff_type: DiffType;
  path: string[];
  old: any;
  new: any;
}

enum SnapshotChangeType {
  Update = "UPDATE",
  Create = "CREATE",
  Delete = "DELETE",
}

enum SnapshotObjectType {
  Level = "level",
  LevelEngine = "levelengine",
  LevelGenre = "levelgenre",
  LevelTag = "leveltag",
  LevelDuration = "levelduration",
  LevelDifficulty = "leveldifficulty",
  LevelReview = "levelreview",
}

interface SnapshotListing {
  id: number;
  created: string;
  object_id: string;
  object_name: string;
  object_type: SnapshotObjectType;
  object_desc: any;
  change_author: UserNested | null;
  change_type: SnapshotChangeType;
  diff: DiffItem[];
  reviewer: UserNested | null;
}

interface SnapshotList extends PagedResponse<SnapshotListing> {}

interface SnapshotSearchQuery extends GenericSearchQuery {
  level?: number | undefined;
  isReviewed?: boolean | undefined;
}

interface SnapshotSearchResult
  extends GenericSearchResult<SnapshotSearchQuery, SnapshotListing> {}

const searchSnapshots = async (
  searchQuery: SnapshotSearchQuery
): Promise<SnapshotSearchResult> => {
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
  const response = (await api.get(`${API_URL}/snapshots/`, {
    params,
  })) as AxiosResponse<SnapshotSearchResult>;
  return { ...response.data, searchQuery };
};

const approve = async (snapshotId: number): Promise<void> => {
  await api.post(`${API_URL}/snapshots/${snapshotId}/approve/`);
};

const SnapshotService = {
  searchSnapshots,
  approve,
};

export type {
  DiffItem,
  SnapshotListing,
  SnapshotList,
  SnapshotSearchQuery,
  SnapshotSearchResult,
};

export { DiffType, SnapshotObjectType, SnapshotChangeType, SnapshotService };
