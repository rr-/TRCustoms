import { useState } from "react";
import { WalkthroughsBar } from "src/components/common/WalkthroughsBar";
import { WalkthroughsList } from "src/components/common/WalkthroughsList";
import { DISABLE_PAGING } from "src/constants";
import type { LevelDetails } from "src/services/LevelService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";

const getWalkthroughSearchQuery = (
  levelId: number
): WalkthroughSearchQuery => ({
  levels: [levelId],
  page: DISABLE_PAGING,
  sort: "-last_updated",
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

      <WalkthroughsList
        showLevels={false}
        searchQuery={walkthroughSearchQuery}
        onSearchQueryChange={setWalkthroughSearchQuery}
      />
    </>
  );
};

export { LevelWalkthroughsTab };
