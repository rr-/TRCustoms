import { useEffect } from "react";
import { useState } from "react";
import { WalkthroughsTable } from "src/components/common/WalkthroughsTable";
import type { UserDetails } from "src/services/UserService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";

const getWalkthroughSearchQuery = (userId: number): WalkthroughSearchQuery => ({
  authors: [userId],
  page: null,
  sort: "-created",
  search: "",
});

interface WalkthroughsTabProps {
  user: UserDetails;
  isLoggedIn: boolean;
}

const WalkthroughsTab = ({ user, isLoggedIn }: WalkthroughsTabProps) => {
  const [walkthroughSearchQuery, setWalkthroughSearchQuery] = useState<
    WalkthroughSearchQuery
  >(getWalkthroughSearchQuery(user.id));

  useEffect(() => {
    setWalkthroughSearchQuery(getWalkthroughSearchQuery(user.id));
  }, [user.id]);

  return (
    <WalkthroughsTable
      showLevelNames={true}
      showAuthors={false}
      showWalkthroughType={true}
      showStatus={isLoggedIn}
      searchQuery={walkthroughSearchQuery}
      onSearchQueryChange={setWalkthroughSearchQuery}
    />
  );
};

export { WalkthroughsTab };
