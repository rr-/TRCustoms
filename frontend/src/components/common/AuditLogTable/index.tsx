import styles from "./index.module.css";
import { useQuery } from "react-query";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { Loader } from "src/components/common/Loader";
import { IconExclamation } from "src/components/icons";
import { EngineLink } from "src/components/links/EngineLink";
import { GenreLink } from "src/components/links/GenreLink";
import { LevelLink } from "src/components/links/LevelLink";
import { NewsLink } from "src/components/links/NewsLink";
import { TagLink } from "src/components/links/TagLink";
import { UserLink } from "src/components/links/UserLink";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import { AuditLogService } from "src/services/AuditLogService";
import type { AuditLogListing } from "src/services/AuditLogService";
import { AuditLogObjectType } from "src/services/AuditLogService";
import type { AuditLogSearchResult } from "src/services/AuditLogService";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";
import { formatDateTime } from "src/utils/string";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils/string";

interface AuditLogTableProps {
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

    case AuditLogObjectType.Engine:
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

    case AuditLogObjectType.Tag:
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
            id: +auditLog.meta.level_id,
            name: auditLog.meta.level_name,
          }}
        >
          Review of {auditLog.object_name}
        </LevelLink>
      );

    case AuditLogObjectType.LevelDuration:
      return <>Duration {auditLog.object_name}</>;

    case AuditLogObjectType.LevelDifficulty:
      return <>Difficulty {auditLog.object_name}</>;

    case AuditLogObjectType.News:
      return (
        <NewsLink
          news={{
            id: +auditLog.object_id,
            subject: auditLog.object_name,
            text: null,
            created: "",
            last_updated: "",
          }}
        >
          News #{auditLog.object_id}: {auditLog.object_name}
        </NewsLink>
      );

    case AuditLogObjectType.Walkthrough:
      return (
        <WalkthroughLink
          walkthrough={{
            id: +auditLog.object_id,
            levelName: auditLog.object_name,
          }}
        >
          Walkthrough for {auditLog.object_name}
        </WalkthroughLink>
      );

    default:
      return (
        <>
          {auditLog.object_type} #{auditLog.object_id}
        </>
      );
  }
};

const AuditLogTable = ({
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
      itemElement: ({ item }) => formatDateTime(item.created),
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
    {
      name: "object",
      label: "Object",
      itemElement: ({ item }: { item: AuditLogListing }) => (
        <AuditLogTableObjectLink auditLog={item} />
      ),
    },
    {
      name: "changes",
      label: "Changes",
      itemElement: ({ item }) => (
        <span className={styles.changesWrapper}>
          {item.changes.join(" ")}
          {item.is_action_required && (
            <span className={styles.requiresAction}>
              <IconExclamation /> Requires action
            </span>
          )}
        </span>
      ),
    },
  ];

  const itemKey = (auditLog: AuditLogListing) => `${auditLog.id}`;

  return (
    <DataTable
      className={styles.table}
      queryName="auditLogs"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={AuditLogService.searchAuditLogs}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { AuditLogTable };
