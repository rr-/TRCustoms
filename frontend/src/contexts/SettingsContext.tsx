import { StorageService } from "src/services/StorageService";
import { create } from "zustand";

interface Theme {
  name: string;
  stub: string;
}

enum AutoPlaylistChoice {
  Ask = "ask",
  No = "no",
  Yes = "yes",
}

enum MarkdownPreviewMode {
  Tabbed = "tab",
  SideBySide = "side",
}

const themes: Theme[] = [
  { name: "Midnight ocean", stub: "midnight_ocean" },
  { name: "Sepia flashback", stub: "sepia_flashback" },
  { name: "Diluted calico", stub: "diluted_calico" },
  { name: "Film noir", stub: "film_noir" },
  { name: "Mystic Forest", stub: "mystic_forest" },
  { name: "Lettuce", stub: "lettuce" },
  { name: "Metropolis", stub: "metropolis" },
  { name: "Robotic", stub: "robotic" },
  { name: "Sundown", stub: "sundown" },
  { name: "Candy", stub: "candy" },
];

interface SettingsState {
  theme: Theme;
  getAllThemes: () => Theme[];
  setTheme: (theme: Theme) => void;

  infiniteScroll: boolean;
  setInfiniteScroll: (infiniteScroll: boolean) => void;

  markdownPreviewMode: MarkdownPreviewMode;
  setMarkdownPreviewMode: (markdownPreviewMode: MarkdownPreviewMode) => void;

  autoPlaylistChoice: AutoPlaylistChoice;
  setAutoPlaylistChoice: (autoPlaylistChoice: AutoPlaylistChoice) => void;
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

  autoPlaylistChoice: (StorageService.getItem("autoPlaylistChoice") ??
    AutoPlaylistChoice.Ask) as AutoPlaylistChoice,
  setAutoPlaylistChoice: (autoPlaylistChoice: AutoPlaylistChoice): void => {
    set((state) => ({ ...state, autoPlaylistChoice }));
    StorageService.setItem("autoPlaylistChoice", autoPlaylistChoice);
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
export { AutoPlaylistChoice, MarkdownPreviewMode, useSettings };
