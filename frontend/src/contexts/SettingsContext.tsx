import { StorageService } from "src/services/StorageService";
import { resolveStoredTheme, themes } from "src/utils/themeStorage";
import type { Theme } from "src/utils/themeStorage";
import { create } from "zustand";

enum AutoPlaylistChoice {
  Ask = "ask",
  No = "no",
  Yes = "yes",
}

enum MarkdownPreviewMode {
  Tabbed = "tab",
  SideBySide = "side",
}

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
  theme: resolveStoredTheme(StorageService.getItem("theme")),

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
    StorageService.setItem("infiniteScroll", String(infiniteScroll));
  },

  markdownPreviewMode:
    (StorageService.getItem(
      "markdownPreviewMode",
    ) as MarkdownPreviewMode | null) || MarkdownPreviewMode.SideBySide,
  setMarkdownPreviewMode: (markdownPreviewMode: MarkdownPreviewMode): void => {
    set((state) => ({ ...state, markdownPreviewMode }));
    StorageService.setItem("markdownPreviewMode", markdownPreviewMode);
  },
}));

export type { Theme, SettingsState };
export { AutoPlaylistChoice, MarkdownPreviewMode, useSettings };
