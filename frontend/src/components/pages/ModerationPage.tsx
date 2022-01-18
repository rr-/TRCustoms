import "./ModerationPage.css";
import { InformationCircleIcon } from "@heroicons/react/outline";
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
      <div className="ModerationPage--disclaimer">
        <div className="ModerationPage--disclaimerType">
          <InformationCircleIcon className="icon" />
        </div>
        <div className="ModerationPage--disclaimerText">
          The log contains recent changes made by all users. All these changes
          are already live.
          <br />
          Click "Mark as read" if the change doesn't need further action and can
          be hidden from everyone's audit log.
          <br />
          New levels can be approved on the individual level page.
        </div>
      </div>
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
