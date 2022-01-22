import "./SnapshotsTable.css";
import { useQueryClient } from "react-query";
import { useQuery } from "react-query";
import { SnapshotService } from "src/services/snapshot.service";
import type { Snapshot } from "src/services/snapshot.service";
import { SnapshotObjectType } from "src/services/snapshot.service";
import type { SnapshotSearchResult } from "src/services/snapshot.service";
import type { SnapshotSearchQuery } from "src/services/snapshot.service";
import { UserPermission } from "src/services/user.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { Loader } from "src/shared/components/Loader";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { SnapshotDiffView } from "src/shared/components/SnapshotDiffView";
import { EngineLink } from "src/shared/components/links/EngineLink";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { TagLink } from "src/shared/components/links/TagLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface SnapshotsTableProps {
  showObjects: boolean;
  showApprovalButton: boolean;
  searchQuery: SnapshotSearchQuery;
  onSearchQueryChange?: (searchQuery: SnapshotSearchQuery) => any | null;
}

interface SnapshotsTableObjectLinkProps {
  snapshot: Snapshot;
}

const SnapshotsTableObjectLink = ({
  snapshot,
}: SnapshotsTableObjectLinkProps) => {
  switch (snapshot.object_type) {
    case SnapshotObjectType.Level:
      return (
        <LevelLink
          level={{
            id: +snapshot.object_id,
            name: snapshot.object_name,
          }}
          label={`Level ${snapshot.object_name}`}
        />
      );

    case SnapshotObjectType.LevelEngine:
      return (
        <EngineLink
          engine={{
            id: +snapshot.object_id,
            name: snapshot.object_name,
          }}
          label={`Engine ${snapshot.object_name}`}
        />
      );

    case SnapshotObjectType.LevelGenre:
      return (
        <GenreLink
          genre={{
            id: +snapshot.object_id,
            name: snapshot.object_name,
          }}
          label={`Genre ${snapshot.object_name}`}
        />
      );

    case SnapshotObjectType.LevelTag:
      return (
        <TagLink
          tag={{
            id: +snapshot.object_id,
            name: snapshot.object_name,
          }}
          label={`Tag ${snapshot.object_name}`}
        />
      );

    case SnapshotObjectType.LevelReview:
      return (
        <LevelLink
          level={{
            id: snapshot.object_desc.level.id,
            name: snapshot.object_desc.level.name,
          }}
          label={`Review for ${snapshot.object_desc.level.name}`}
        />
      );

    case SnapshotObjectType.LevelDuration:
      return <>{`Duration ${snapshot.object_name}`}</>;

    case SnapshotObjectType.LevelDifficulty:
      return <>{`Difficulty ${snapshot.object_name}`}</>;

    default:
      return <>{`${snapshot.object_type} #${snapshot.object_id}`}</>;
  }
};

const SnapshotsTable = ({
  showObjects,
  showApprovalButton,
  searchQuery,
  onSearchQueryChange,
}: SnapshotsTableProps) => {
  const queryClient = useQueryClient();
  const result = useQuery<SnapshotSearchResult, Error>(
    ["snapshots", SnapshotService.searchSnapshots, searchQuery],
    async () => SnapshotService.searchSnapshots(searchQuery)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const approveSnapshot = async (snapshot: Snapshot) => {
    if (window.confirm("Are you sure this change is OK?")) {
      await SnapshotService.approve(snapshot.id);
      result.refetch();
      queryClient.removeQueries("snapshots");
    }
  };

  const columns: DataTableColumn<Snapshot>[] = [
    {
      name: "created",
      label: "Created",
      itemElement: (snapshot) => formatDate(snapshot.created),
    },
    {
      name: "author",
      label: "Author",
      itemElement: (snapshot) =>
        snapshot.change_author ? (
          <UserLink user={snapshot.change_author} />
        ) : (
          EMPTY_INPUT_PLACEHOLDER
        ),
    },
    ...(showObjects
      ? [
          {
            name: "object",
            label: "Object",
            itemElement: (snapshot: Snapshot) => (
              <SnapshotsTableObjectLink snapshot={snapshot} />
            ),
          },
        ]
      : []),
    {
      name: "changes",
      label: "Changes",
      itemElement: (snapshot) => <SnapshotDiffView snapshot={snapshot} />,
    },
    {
      name: "review",
      label: "Review",
      itemElement: (snapshot) =>
        snapshot.reviewer ? (
          <UserLink user={snapshot.reviewer} />
        ) : showApprovalButton ? (
          <PermissionGuard
            require={UserPermission.reviewSnapshots}
            alternative={EMPTY_INPUT_PLACEHOLDER}
          >
            <PushButton
              disableTimeout={true}
              onClick={() => approveSnapshot(snapshot)}
            >
              Mark as read
            </PushButton>
          </PermissionGuard>
        ) : (
          EMPTY_INPUT_PLACEHOLDER
        ),
    },
  ];

  const itemKey = (snapshot: Snapshot) => `${snapshot.id}`;

  return (
    <div className="SnapshotsTable">
      <DataTable
        className="SnapshotsTable"
        queryName="snapshots"
        columns={columns}
        itemKey={itemKey}
        searchQuery={searchQuery}
        searchFunc={SnapshotService.searchSnapshots}
        onSearchQueryChange={onSearchQueryChange}
      />
    </div>
  );
};

export { SnapshotsTable };
