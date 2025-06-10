import styles from "./index.module.css";
import { Card, CardGrid } from "src/components/common/Card";
import { DataList } from "src/components/common/DataList";
import { UserPictureMode } from "src/components/common/UserPicture";
import { UserPicture } from "src/components/common/UserPicture";
import { UserLink } from "src/components/links/UserLink";
import type { UserListing } from "src/services/UserService";
import type { UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface UserFancyListItemSettings {
  showReviews?: boolean;
}

interface UserViewProps extends UserFancyListItemSettings {
  user: UserListing;
}

const UserView = ({ user, showReviews }: UserViewProps) => (
  <Card>
    <UserLink className={styles.link} user={user}>
      <UserPicture user={user} mode={UserPictureMode.Medium} />
      <span className={styles.username}>{user.username}</span>
    </UserLink>

    <div>
      {showReviews && (
        <>
          Reviews posted: {user.reviewed_level_count}
          <br />
        </>
      )}
      Joined: {formatDate(user.date_joined)}
    </div>
  </Card>
);

interface UserFancyListProps extends UserFancyListItemSettings {
  searchQuery: UserSearchQuery;
  onSearchQueryChange?: ((searchQuery: UserSearchQuery) => void) | undefined;
  onResultCountChange?: ((count: number) => void) | undefined;
}

const UserFancyList = ({
  searchQuery,
  showReviews,
  onSearchQueryChange,
  onResultCountChange,
}: UserFancyListProps) => {
  const itemKey = (user: UserListing) => `${user.id}`;
  const itemView = (user: UserListing) => (
    <UserView showReviews={showReviews} user={user} />
  );
  const pageView = (children: React.ReactNode) => (
    <CardGrid>{children}</CardGrid>
  );

  return (
    <DataList
      className={styles.wrapper}
      queryName="users"
      itemKey={itemKey}
      pageView={pageView}
      itemView={itemView}
      searchQuery={searchQuery}
      searchFunc={UserService.searchUsers}
      onSearchQueryChange={onSearchQueryChange}
      onResultCountChange={onResultCountChange}
    />
  );
};

export { UserFancyList };
