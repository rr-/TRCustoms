import "./index.css";
import { DataList } from "src/components/common/DataList";
import { UserPictureMode } from "src/components/common/UserPicture";
import { UserPicture } from "src/components/common/UserPicture";
import { UserLink } from "src/components/links/UserLink";
import type { UserListing } from "src/services/UserService";
import type { UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface UserViewProps {
  user: UserListing;
}

const UserView = ({ user }: UserViewProps) => {
  return (
    <article className="UserView">
      <UserLink user={user}>
        <UserPicture user={user} mode={UserPictureMode.Medium} />
        <br />
        {user.username}
      </UserLink>
      <div>
        Reviews posted: {user.reviewed_level_count}
        <br />
        Joined: {formatDate(user.date_joined)}
      </div>
    </article>
  );
};

interface UserFancyListProps {
  searchQuery: UserSearchQuery;
  onSearchQueryChange?: ((searchQuery: UserSearchQuery) => void) | undefined;
}

const UserFancyList = ({
  searchQuery,
  onSearchQueryChange,
}: UserFancyListProps) => {
  const itemView = (user: UserListing) => <UserView user={user} />;

  const itemKey = (user: UserListing) => `${user.id}`;

  return (
    <DataList
      className="UserFancyList"
      queryName="users"
      itemKey={itemKey}
      itemView={itemView}
      searchQuery={searchQuery}
      searchFunc={UserService.searchUsers}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { UserFancyList };
