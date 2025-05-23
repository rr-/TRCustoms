import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { UserLink } from "src/components/links/UserLink";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { formatDate } from "src/utils/string";

interface WalkthroughsTableProps {
  searchQuery: WalkthroughSearchQuery;
  onSearchQueryChange?:
    | ((searchQuery: WalkthroughSearchQuery) => void)
    | undefined;
  showAuthors: boolean;
  showLevelNames: boolean;
  showWalkthroughType: boolean;
  showStatus: boolean;
}

const WalkthroughsTable = ({
  searchQuery,
  onSearchQueryChange,
  showAuthors,
  showLevelNames,
  showWalkthroughType,
  showStatus,
}: WalkthroughsTableProps) => {
  let columns: DataTableColumn<WalkthroughListing>[] = [
    {
      name: "name",
      sortKey: "level__name",
      label: showLevelNames ? "Level name" : "Guide",
      itemElement: ({ item }) => (
        <WalkthroughLink
          walkthrough={{
            id: item.id,
            levelName: item.level.name,
          }}
        >
          {showLevelNames
            ? item.level.name
            : {
                [WalkthroughType.Link]: "Watch the video",
                [WalkthroughType.Text]: "Read the guide",
              }[item.walkthrough_type] || "Open walkthrough"}
        </WalkthroughLink>
      ),
    },
    {
      name: "author",
      sortKey: "author__username",
      label: "Submitted by",
      itemElement: ({ item }) =>
        item.author ? (
          <UserLink user={item.author} />
        ) : (
          item.legacy_author_name || "Unknown author"
        ),
    },
    {
      name: "walkthrough_type",
      sortKey: "walkthrough_type",
      label: "Guide type",
      itemElement: ({ item }) =>
        ({
          [WalkthroughType.Link]: "Video",
          [WalkthroughType.Text]: "Text",
        })[item.walkthrough_type] || "Unknown",
    },
    {
      name: "created",
      sortKey: "created",
      label: "Submitted on",
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "updated",
      sortKey: "last_user_content_updated",
      label: "Updated",
      itemElement: ({ item }) =>
        item.last_user_content_updated
          ? formatDate(item.last_user_content_updated)
          : "Never",
    },
    {
      name: "status",
      label: "Status",
      itemElement: ({ item }) =>
        ({
          [WalkthroughStatus.Draft]: "Draft",
          [WalkthroughStatus.PendingApproval]: "Pending approval",
          [WalkthroughStatus.Approved]: "Approved",
          [WalkthroughStatus.Rejected]: `Rejected (reason: ${item.rejection_reason})`,
        })[item.status],
    },
  ];

  if (!showStatus) {
    columns = columns.filter((column) => column.name !== "status");
  }
  if (!showWalkthroughType) {
    columns = columns.filter((column) => column.name !== "walkthrough_type");
  }
  if (!showAuthors) {
    columns = columns.filter((column) => column.name !== "author");
  }

  const itemKey = (walkthrough: WalkthroughListing) => `${walkthrough.id}`;

  return (
    <DataTable
      queryName="walkthroughs"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={WalkthroughService.searchWalkthroughs}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { WalkthroughsTable };
