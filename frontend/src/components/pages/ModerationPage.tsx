import { useState } from "react";
import type { LevelSearchQuery } from "src/services/level.service";
import { LevelsTable } from "src/shared/components/LevelsTable";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "-created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  isApproved: false,
};

const ModerationPage = () => {
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    defaultSearchQuery
  );

  return (
    <div id="ModerationPage">
      <h1>Unapproved levels</h1>

      <LevelsTable
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
};

export { ModerationPage };
