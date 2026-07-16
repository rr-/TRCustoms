import styles from "./index.module.css";
import { useContext } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Collapsible } from "src/components/common/Collapsible";
import { DatePicker } from "src/components/common/DatePicker";
import { DifficultiesCheckboxes } from "src/components/common/DifficultiesCheckboxes";
import { DurationsCheckboxes } from "src/components/common/DurationsCheckboxes";
import { EnginesCheckboxes } from "src/components/common/EnginesCheckboxes";
import { GenresCheckboxes } from "src/components/common/GenresCheckboxes";
import { WalkthroughRadioboxes } from "src/components/common/LevelSearchSidebar/WalkthroughRadioboxes";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { Radioboxes } from "src/components/common/Radioboxes";
import { RatingsCheckboxes } from "src/components/common/RatingsCheckboxes";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import { SidebarBox } from "src/components/common/SidebarBox";
import { TagsCheckboxes } from "src/components/common/TagsCheckboxes";
import { Form } from "src/components/forms/Form";
import { SubmitButton } from "src/components/forms/SubmitButton";
import { DropDownField } from "src/components/forms/fields/DropDownField";
import { TextField } from "src/components/forms/fields/TextField";
import { IconSearch } from "src/components/icons";
import { UserContext } from "src/contexts/UserContext";
import { LevelPlaylistDroppedLevelFilter } from "src/services/LevelService";
import { LevelPlaylistFinishedLevelFilter } from "src/services/LevelService";
import type { LevelSearchQuery } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

const sortOptions = [
  { label: "Most recent", value: "-created" },
  { label: "Least recent", value: "created" },
  { label: "Best rated", value: "-rating" },
  { label: "Worst rated", value: "rating" },
  { label: "Most downloaded", value: "-download_count" },
  { label: "Least downloaded", value: "download_count" },
  { label: "Biggest size", value: "-size" },
  { label: "Smallest size", value: "size" },
];

interface RadioOption<TValue> {
  id: TValue;
  name: string;
}

const playlistFinishedLevelOptions: RadioOption<LevelPlaylistFinishedLevelFilter>[] =
  [
    { id: LevelPlaylistFinishedLevelFilter.ShowAll, name: "Show all" },
    { id: LevelPlaylistFinishedLevelFilter.Hide, name: "Hide" },
    { id: LevelPlaylistFinishedLevelFilter.Unrated, name: "Unrated only" },
    {
      id: LevelPlaylistFinishedLevelFilter.Unreviewed,
      name: "Unreviewed only",
    },
  ];

const playlistDroppedLevelOptions: RadioOption<LevelPlaylistDroppedLevelFilter>[] =
  [
    { id: LevelPlaylistDroppedLevelFilter.ShowAll, name: "Show all" },
    { id: LevelPlaylistDroppedLevelFilter.Hide, name: "Hide" },
  ];

const toFormValues = (
  searchQuery: LevelSearchQuery,
  defaultSearchQuery: LevelSearchQuery,
) => ({
  sort: searchQuery.sort || defaultSearchQuery.sort || "",
  search: searchQuery.search || "",
});

interface LevelSearchProps {
  defaultSearchQuery: LevelSearchQuery;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => void;
}

const LevelSearchSidebar = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: LevelSearchProps) => {
  const loggedInUser = useContext(UserContext).user;
  const form = useForm({
    defaultValues: toFormValues(searchQuery, defaultSearchQuery),
  });

  // Keep the form in sync when the query changes externally (URL, reset, or the
  // standalone filter widgets below).
  const { reset } = form;
  useEffect(
    () => reset(toFormValues(searchQuery, defaultSearchQuery)),
    [searchQuery, defaultSearchQuery, reset],
  );

  // Only sort and search are form fields; every other filter is a standalone
  // widget that edits the query directly.
  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      sort: values.sort,
      search: values.search,
    });
  });

  const handleIsApprovedChange = useCallback(
    (value: boolean | null) => {
      onSearchQueryChange({ ...searchQuery, isApproved: value });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleEnginesChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, engines: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleGenresChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, genres: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleDateChange = useCallback(
    (value: string) => {
      onSearchQueryChange({ ...searchQuery, page: null, date: value });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleTagsChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, tags: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleDurationsChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, durations: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleDifficultiesChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, difficulties: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleWalkthroughsChange = useCallback(
    (videoWalkthroughs: boolean | null, textWalkthroughs: boolean | null) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        videoWalkthroughs: videoWalkthroughs,
        textWalkthroughs: textWalkthroughs,
      });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handlePlaylistFinishedLevelsChange = useCallback(
    (playlistFinishedLevels: LevelPlaylistFinishedLevelFilter) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        playlistFinishedLevels,
      });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handlePlaylistDroppedLevelsChange = useCallback(
    (playlistDroppedLevels: LevelPlaylistDroppedLevelFilter) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        playlistDroppedLevels,
      });
    },
    [searchQuery, onSearchQueryChange],
  );

  const handleRatingsChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({ ...searchQuery, page: null, ratings: values });
    },
    [searchQuery, onSearchQueryChange],
  );

  return (
    <SidebarBox>
      <Form
        form={form}
        onSubmit={submit}
        className={`${styles.wrapper} ChildMarginClear`}
      >
        <SidebarBoxHeader alignToTabSwitch={true}>
          <span className={styles.header}>
            Search filter
            <Link
              className={styles.resetButton}
              onClick={() => onSearchQueryChange(defaultSearchQuery)}
            >
              (reset)
            </Link>
          </span>
        </SidebarBoxHeader>

        <PermissionGuard require={UserPermission.viewPendingLevels}>
          <div className={styles.section}>
            <Radioboxes
              header="Approval status"
              options={[
                { id: null, name: "Show all" },
                { id: true, name: "Approved only" },
                { id: false, name: "Unapproved only" },
              ]}
              value={searchQuery.isApproved}
              onChange={handleIsApprovedChange}
              getOptionId={(option) => option.id}
              getOptionName={(option) => option.name}
            />
          </div>
        </PermissionGuard>

        <div className={styles.section}>
          <DropDownField
            onChange={() => submit()}
            label="Sort"
            name="sort"
            options={sortOptions}
          />
        </div>

        <div className={`${styles.section} ${styles.searchBar}`}>
          <TextField label="Search" name="search" />
          <div className="FormField">
            <SubmitButton icon={<IconSearch />} />
          </div>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchGenres" title="Genre">
            <GenresCheckboxes
              value={searchQuery.genres || []}
              onChange={handleGenresChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchTags" title="Tags">
            <TagsCheckboxes
              value={searchQuery.tags || []}
              onChange={handleTagsChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchEngines" title="Engine">
            <EnginesCheckboxes
              value={searchQuery.engines || []}
              onChange={handleEnginesChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelDate" title="Date">
            <DatePicker value={searchQuery.date} onChange={handleDateChange} />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchRatings" title="Rating">
            <RatingsCheckboxes
              value={searchQuery.ratings || []}
              onChange={handleRatingsChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchDurations" title="Duration">
            <DurationsCheckboxes
              value={searchQuery.durations || []}
              onChange={handleDurationsChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelSearchDifficulties" title="Difficulty">
            <DifficultiesCheckboxes
              value={searchQuery.difficulties || []}
              onChange={handleDifficultiesChange}
            />
          </Collapsible>
        </div>

        <div className={styles.section}>
          <Collapsible storageKey="levelWalkthroughs" title="Walkthroughs">
            <WalkthroughRadioboxes
              videoWalkthroughs={searchQuery.videoWalkthroughs}
              textWalkthroughs={searchQuery.textWalkthroughs}
              onChange={handleWalkthroughsChange}
            />
          </Collapsible>
        </div>

        {loggedInUser && (
          <div className={styles.section}>
            <Collapsible
              storageKey="levelPlaylistStatus"
              title="Playlist status"
            >
              <p>Finished levels:</p>
              <Radioboxes
                options={playlistFinishedLevelOptions}
                value={
                  searchQuery.playlistFinishedLevels ||
                  LevelPlaylistFinishedLevelFilter.ShowAll
                }
                onChange={handlePlaylistFinishedLevelsChange}
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
                onChange={handlePlaylistDroppedLevelsChange}
                getOptionId={(option) => option.id}
                getOptionName={(option) => option.name}
              />
            </Collapsible>
          </div>
        )}
      </Form>
    </SidebarBox>
  );
};

export { LevelSearchSidebar };
