import { StorageService } from "src/services/StorageService";
import create from "zustand";

interface Theme {
  name: string;
  stub: string;
}

enum MarkdownPreviewMode {
  Tabbed = "tab",
  SideBySide = "side",
}

const themes: Theme[] = [
  {
    name: "Midnight ocean",
    stub: "midnight_ocean",
  },
  {
    name: "Sepia flashback",
    stub: "sepia_flashback",
  },
  {
    name: "Diluted calico",
    stub: "diluted_calico",
  },
  {
    name: "Metropolis",
    stub: "metropolis",
  },
  {
    name: "Robotic",
    stub: "robotic",
  },
  {
    name: "Lettuce",
    stub: "lettuce",
  },
  {
    name: "Sundown",
    stub: "sundown",
  },
];

interface SettingsState {
  theme: Theme;
  getAllThemes: () => Theme[];
  setTheme: (theme: Theme) => void;

  infiniteScroll: boolean;
  setInfiniteScroll: (infiniteScroll: boolean) => void;

  markdownPreviewMode: MarkdownPreviewMode;
  setMarkdownPreviewMode: (markdownPreviewMode: MarkdownPreviewMode) => void;
}

const useSettings = create<SettingsState>((set, get) => ({
  theme:
    themes.find((t) => t.name === StorageService.getItem("theme")) || themes[0],

  getAllThemes: (): Theme[] => {
    return themes;
  },

  setTheme: (theme: Theme): void => {
    set((state) => ({ ...state, theme }));
    StorageService.setItem("theme", theme.name);
  },

  infiniteScroll: StorageService.getItem("infiniteScroll") === "true" || false,
  setInfiniteScroll: (infiniteScroll: boolean): void => {
    set((state) => ({ ...state, infiniteScroll }));
    StorageService.setItem("infiniteScroll", infiniteScroll);
  },

  markdownPreviewMode:
    (StorageService.getItem(
      "markdownPreviewMode"
    ) as MarkdownPreviewMode | null) || MarkdownPreviewMode.SideBySide,
  setMarkdownPreviewMode: (markdownPreviewMode: MarkdownPreviewMode): void => {
    set((state) => ({ ...state, markdownPreviewMode }));
    StorageService.setItem("markdownPreviewMode", markdownPreviewMode);
  },
}));

export type { Theme, SettingsState };
export { MarkdownPreviewMode, useSettings };
