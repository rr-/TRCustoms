import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { UserFancyList } from "src/components/common/UserFancyList";
import { UserSearch } from "src/components/common/UserSearch";
import { TitleContext } from "src/contexts/TitleContext";
import type { UserSearchQuery } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: UserSearchQuery = {
  page: null,
  pageSize: 10,
  sort: "-date_joined",
  search: null,
  reviewsMin: 1,
  hideInactiveReviewers: false,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): UserSearchQuery => ({
  ...defaultSearchQuery,
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  hideInactiveReviewers: qp.hide_inactive === "1",
});

const serializeSearchQuery = (
  searchQuery: UserSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    hide_inactive: searchQuery.hideInactiveReviewers === true ? "1" : null,
  });

const ReviewAuthorsPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Users");
  }, [setTitle]);

  return (
    <div className="ReviewAuthorsPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <UserSearch
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showInactiveReviewersCheckbox={true}
      />

      <UserFancyList
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
};

export { ReviewAuthorsPage };
