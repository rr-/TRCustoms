import styles from "./index.module.css";
import { RatingDeleteButton } from "src/components/buttons/RatingDeleteButton";
import { RatingEditButton } from "src/components/buttons/RatingEditButton";
import { BurgerMenu } from "src/components/common/BurgerMenu";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { RatingBadge } from "src/components/common/RatingsTable/RatingBadge";
import { LevelLink } from "src/components/links/LevelLink";
import { UserPicLink } from "src/components/links/UserPicLink";
import type { RatingListing } from "src/services/RatingService";
import type { RatingSearchQuery } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";
import { formatDate, formatChangeDate } from "src/utils/string";

interface RatingsTableProps {
  searchQuery: RatingSearchQuery;
  onSearchQueryChange?: ((searchQuery: RatingSearchQuery) => void) | undefined;
  showLevels: boolean;
  showAuthors: boolean;
}

const RatingsTable = ({
  searchQuery,
  onSearchQueryChange,
  showLevels,
  showAuthors,
}: RatingsTableProps) => {
  let columns: DataTableColumn<RatingListing>[] = [
    {
      name: "level",
      sortKey: "level__name",
      label: "Level name",
      className: styles.levelName,
      itemElement: ({ item }) => (
        <LevelLink level={item.level}>{item.level.name}</LevelLink>
      ),
    },
    {
      name: "author",
      sortKey: "author__username",
      label: "Submitted by",
      className: styles.authorName,
      itemElement: ({ item }) => (
        <UserPicLink user={item.author} fallback="Unknown author" />
      ),
    },
    {
      name: "rating",
      sortKey: "rating_class__position",
      label: "Rating",
      className: styles.rating,
      itemElement: ({ item }) =>
        item.rating_class ? (
          <RatingBadge ratingClass={item.rating_class} />
        ) : (
          "Unknown"
        ),
    },
    {
      name: "created",
      sortKey: "created",
      label: "Submitted on",
      className: styles.created,
      itemElement: ({ item }) => formatDate(item.created),
    },
    {
      name: "updated",
      sortKey: "last_user_content_updated",
      label: "Updated",
      className: styles.updated,
      itemElement: ({ item }) =>
        formatChangeDate(item.last_user_content_updated, item.created),
    },
  ];

  columns.push({
    name: "actions",
    label: "",
    className: styles.actions,
    itemElement: ({ item }) => (
      <BurgerMenu>
        <PermissionGuard
          require={UserPermission.editRatings}
          owningUsers={[item.author]}
        >
          <RatingEditButton rating={item} />
        </PermissionGuard>
        <PermissionGuard
          require={UserPermission.editRatings}
          owningUsers={[item.author]}
        >
          <RatingDeleteButton rating={item} />
        </PermissionGuard>
      </BurgerMenu>
    ),
  });

  if (!showLevels) {
    columns = columns.filter((column) => column.name !== "level");
  }
  if (!showAuthors) {
    columns = columns.filter((column) => column.name !== "author");
  }

  const itemKey = (rating: RatingListing) => `${rating.id}`;

  return (
    <DataTable
      queryName="ratings"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={RatingService.searchRatings}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { RatingsTable };
