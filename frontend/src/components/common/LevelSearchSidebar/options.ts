import { LevelPlaylistDroppedLevelFilter } from "src/services/LevelService";
import { LevelPlaylistFinishedLevelFilter } from "src/services/LevelService";

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

export type { RadioOption };
export {
  sortOptions,
  playlistFinishedLevelOptions,
  playlistDroppedLevelOptions,
};
