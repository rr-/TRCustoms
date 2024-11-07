import { WalkthroughListItem } from "./WalkthroughsListItem";
import { DataList } from "src/components/common/DataList";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";

interface WalkthroughsListProps {
  showLevels: boolean;
  searchQuery: WalkthroughSearchQuery;
  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?:
    | ((searchQuery: WalkthroughSearchQuery) => void)
    | undefined;
}

const WalkthroughsList = ({
  showLevels,
  searchQuery,
  onResultCountChange,
  onSearchQueryChange,
}: WalkthroughsListProps) => {
  return (
    <DataList
      searchQuery={searchQuery}
      queryName="walkthroughs"
      onResultCountChange={onResultCountChange}
      onSearchQueryChange={onSearchQueryChange}
      searchFunc={WalkthroughService.searchWalkthroughs}
      itemKey={(walkthrough: WalkthroughListing) => walkthrough.id.toString()}
      itemView={(walkthrough: WalkthroughListing) => (
        <WalkthroughListItem
          walkthrough={walkthrough}
          showLevels={showLevels}
        />
      )}
    />
  );
};

export { WalkthroughsList };
