import styles from "./index.module.css";
import { useCallback } from "react";
import { Collapsible } from "src/components/common/Collapsible";
import { DatePicker } from "src/components/common/DatePicker";
import { DifficultiesCheckboxes } from "src/components/common/DifficultiesCheckboxes";
import { DurationsCheckboxes } from "src/components/common/DurationsCheckboxes";
import { EnginesCheckboxes } from "src/components/common/EnginesCheckboxes";
import { GenresCheckboxes } from "src/components/common/GenresCheckboxes";
import { WalkthroughRadioboxes } from "src/components/common/LevelSearchSidebar/WalkthroughRadioboxes";
import {
  playlistDroppedLevelOptions,
  playlistFinishedLevelOptions,
} from "src/components/common/LevelSearchSidebar/options";
import { Radioboxes } from "src/components/common/Radioboxes";
import { RatingsCheckboxes } from "src/components/common/RatingsCheckboxes";
import { TagsCheckboxes } from "src/components/common/TagsCheckboxes";
import { LevelPlaylistDroppedLevelFilter } from "src/services/LevelService";
import { LevelPlaylistFinishedLevelFilter } from "src/services/LevelService";
import type { LevelSearchQuery } from "src/services/LevelService";
import { useUser } from "src/stores/user";

interface AdvancedFiltersProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => void;
}

// The standalone filter widgets below edit the query directly (they are not
// form fields). Every change also resets paging, so route them through one
// patch helper instead of a handler per filter.
const AdvancedFilters = ({
  searchQuery,
  onSearchQueryChange,
}: AdvancedFiltersProps) => {
  const loggedInUser = useUser().user;

  const patch = useCallback(
    (update: Partial<LevelSearchQuery>) => {
      onSearchQueryChange({ ...searchQuery, page: null, ...update });
    },
    [searchQuery, onSearchQueryChange],
  );

  return (
    <>
      <div className={styles.section}>
        <Collapsible storageKey="levelSearchGenres" title="Genre">
          <GenresCheckboxes
            value={searchQuery.genres || []}
            onChange={(genres) => patch({ genres })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelSearchTags" title="Tags">
          <TagsCheckboxes
            value={searchQuery.tags || []}
            onChange={(tags) => patch({ tags })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelSearchEngines" title="Engine">
          <EnginesCheckboxes
            value={searchQuery.engines || []}
            onChange={(engines) => patch({ engines })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelDate" title="Date">
          <DatePicker
            value={searchQuery.date}
            onChange={(date) => patch({ date })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelSearchRatings" title="Rating">
          <RatingsCheckboxes
            value={searchQuery.ratings || []}
            onChange={(ratings) => patch({ ratings })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelSearchDurations" title="Duration">
          <DurationsCheckboxes
            value={searchQuery.durations || []}
            onChange={(durations) => patch({ durations })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelSearchDifficulties" title="Difficulty">
          <DifficultiesCheckboxes
            value={searchQuery.difficulties || []}
            onChange={(difficulties) => patch({ difficulties })}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="levelWalkthroughs" title="Walkthroughs">
          <WalkthroughRadioboxes
            videoWalkthroughs={searchQuery.videoWalkthroughs}
            textWalkthroughs={searchQuery.textWalkthroughs}
            onChange={(videoWalkthroughs, textWalkthroughs) =>
              patch({ videoWalkthroughs, textWalkthroughs })
            }
          />
        </Collapsible>
      </div>

      {loggedInUser && (
        <div className={styles.section}>
          <Collapsible storageKey="levelPlaylistStatus" title="Playlist status">
            <p>Finished levels:</p>
            <Radioboxes
              options={playlistFinishedLevelOptions}
              value={
                searchQuery.playlistFinishedLevels ||
                LevelPlaylistFinishedLevelFilter.ShowAll
              }
              onChange={(playlistFinishedLevels) =>
                patch({ playlistFinishedLevels })
              }
              getOptionId={(option) => option.id}
              getOptionName={(option) => option.name}
            />

            <p>Dropped levels:</p>
            <Radioboxes
              options={playlistDroppedLevelOptions}
              value={
                searchQuery.playlistDroppedLevels ||
                LevelPlaylistDroppedLevelFilter.ShowAll
              }
              onChange={(playlistDroppedLevels) =>
                patch({ playlistDroppedLevels })
              }
              getOptionId={(option) => option.id}
              getOptionName={(option) => option.name}
            />
          </Collapsible>
        </div>
      )}
    </>
  );
};

export { AdvancedFilters };
