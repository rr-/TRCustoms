import { useState } from "react";
import { WalkthroughsBar } from "src/components/common/WalkthroughsBar";
import { WalkthroughsTable } from "src/components/common/WalkthroughsTable";
import type { LevelDetails } from "src/services/LevelService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";

const getWalkthroughSearchQuery = (
  levelId: number
): WalkthroughSearchQuery => ({
  levels: [levelId],
  page: null,
  sort: "-created",
  search: "",
  isApproved: true,
});

interface LevelWalkthroughsTabProps {
  level: LevelDetails;
}

const LevelWalkthroughsTab = ({ level }: LevelWalkthroughsTabProps) => {
  const [walkthroughSearchQuery, setWalkthroughSearchQuery] = useState<
    WalkthroughSearchQuery
  >(getWalkthroughSearchQuery(level.id));

  return (
    <>
      <WalkthroughsBar level={level} />
      <hr />
      <WalkthroughsTable
        showLevelNames={false}
        showAuthors={true}
        showWalkthroughType={false}
        showStatus={false}
        searchQuery={walkthroughSearchQuery}
        onSearchQueryChange={setWalkthroughSearchQuery}
      />
    </>
  );
};

export { LevelWalkthroughsTab };
