import { ExclamationIcon } from "@heroicons/react/outline";
import { useState } from "react";
import type { SnapshotSearchQuery } from "src/services/snapshot.service";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { SnapshotsTable } from "src/shared/components/SnapshotsTable";

const ModerationPage = () => {
  const [searchQuery, setSearchQuery] = useState<SnapshotSearchQuery>({
    isReviewed: false,
    page: null,
    sort: "-created",
    search: null,
  });

  return (
    <div id="ModerationPage">
      <p>
        This page lists all actions recently performed by the users. As a
        moderator, you can review these changes and once you are sure that the
        change is OK, you can mark it as reviewed by clicking on the "reviewed"
        button near each item. Clicking on it will make it disappear from this
        listing only. Trolling attempts need to be dealt with through manual
        action.
      </p>
      <p>
        <ExclamationIcon className="icon" /> The changes listed here have
        happened in the past and are already live.
      </p>
      <p>
        <ExclamationIcon className="icon" /> New levels need to be approved
        separately from the level page. This approval can be reverted at any
        time.
      </p>
      <SectionHeader>Recent actions</SectionHeader>
      <SnapshotsTable
        showObjects={true}
        showApprovalButton={true}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
};

export { ModerationPage };
