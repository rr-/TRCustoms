import "./AuditLogTable.css";
import { ExclamationIcon } from "@heroicons/react/outline";
import { useQuery } from "react-query";
import { AuditLogService } from "src/services/auditLog.service";
import type { AuditLogListing } from "src/services/auditLog.service";
import { AuditLogObjectType } from "src/services/auditLog.service";
import type { AuditLogSearchResult } from "src/services/auditLog.service";
import type { AuditLogSearchQuery } from "src/services/auditLog.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { Loader } from "src/shared/components/Loader";
import { EngineLink } from "src/shared/components/links/EngineLink";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { TagLink } from "src/shared/components/links/TagLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface AuditLogTableProps {
  showObjects: boolean;
  searchQuery: AuditLogSearchQuery;
  onSearchQueryChange?:
    | ((searchQuery: AuditLogSearchQuery) => void)
    | undefined;
}

interface AuditLogTableObjectLinkProps {
  auditLog: AuditLogListing;
}

const AuditLogTableObjectLink = ({
  auditLog,
}: AuditLogTableObjectLinkProps) => {
  switch (auditLog.object_type) {
    case AuditLogObjectType.User:
      return (
        <UserLink
          user={{
            id: +auditLog.object_id,
            username: auditLog.object_name,
          }}
        >
          User {auditLog.object_name}
        </UserLink>
      );

    case AuditLogObjectType.Level:
      return (
        <LevelLink
          level={{
            id: +auditLog.object_id,
            name: auditLog.object_name,
          }}
        >
          Level {auditLog.object_name}
        </LevelLink>
      );

    case AuditLogObjectType.LevelEngine:
      return (
        <EngineLink
          engine={{
            id: +auditLog.object_id,
            name: auditLog.object_name,
          }}
        >
          Engine {auditLog.object_name}
        </EngineLink>
      );

    case AuditLogObjectType.LevelGenre:
      return (
        <GenreLink
          genre={{
            id: +auditLog.object_id,
            name: auditLog.object_name,
          }}
        >
          Genre {auditLog.object_name}
        </GenreLink>
      );

    case AuditLogObjectType.LevelTag:
      return (
        <TagLink
          tag={{
            id: +auditLog.object_id,
            name: auditLog.object_name,
          }}
        >
          Tag {auditLog.object_name}
        </TagLink>
      );

    case AuditLogObjectType.LevelReview:
      return (
        <LevelLink
          level={{
            id: +auditLog.object_id,
            name: auditLog.object_name,
          }}
        >
          Review of {auditLog.object_name}
        </LevelLink>
      );

    case AuditLogObjectType.LevelDuration:
      return <>{`Duration ${auditLog.object_name}`}</>;

    case AuditLogObjectType.LevelDifficulty:
      return <>{`Difficulty ${auditLog.object_name}`}</>;

    default:
      return <>{`${auditLog.object_type} #${auditLog.object_id}`}</>;
  }
};

const AuditLogTable = ({
  showObjects,
  searchQuery,
  onSearchQueryChange,
}: AuditLogTableProps) => {
  const result = useQuery<AuditLogSearchResult, Error>(
    ["auditLogs", AuditLogService.searchAuditLogs, searchQuery],
    async () => AuditLogService.searchAuditLogs(searchQuery)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const columns: DataTableColumn<AuditLogListing>[] = [
    {
      name: "created",
      label: "Created",
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "author",
      label: "Author",
      itemElement: ({ item }) =>
        item.change_author ? (
          <UserLink user={item.change_author} />
        ) : (
          EMPTY_INPUT_PLACEHOLDER
        ),
    },
    ...(showObjects
      ? [
          {
            name: "object",
            label: "Object",
            itemElement: ({ item }: { item: AuditLogListing }) => (
              <AuditLogTableObjectLink auditLog={item} />
            ),
          },
        ]
      : []),
    {
      name: "changes",
      label: "Changes",
      itemElement: ({ item }) => (
        <ul className="AuditLogTable--changeList">
          {item.changes.map((change, i) => (
            <li key={i} className="AuditLogTable--changeListItem">
              {change}
            </li>
          ))}
        </ul>
      ),
    },
    {
      name: "requires_action",
      label: "",
      itemElement: ({ item }) =>
        item.is_action_required ? (
          <>
            <ExclamationIcon className="icon" /> Requires action
          </>
        ) : (
          ""
        ),
    },
  ];

  const itemKey = (auditLog: AuditLogListing) => `${auditLog.id}`;

  return (
    <div className="AuditLogTable">
      <DataTable
        className="AuditLogTable"
        queryName="auditLogs"
        columns={columns}
        itemKey={itemKey}
        searchQuery={searchQuery}
        searchFunc={AuditLogService.searchAuditLogs}
        onSearchQueryChange={onSearchQueryChange}
      />
    </div>
  );
};

export { AuditLogTable };
