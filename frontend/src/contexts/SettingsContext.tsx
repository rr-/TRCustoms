import { StorageService } from "src/services/StorageService";
import create from "zustand";

interface Theme {
  name: string;
  stub: string;
}

const themes: Theme[] = [
  {
    name: "Midnight ocean",
    stub: "midnight_ocean",
  },
  {
    name: "Robotic",
    stub: "robotic",
  },
  {
    name: "Lettuce",
    stub: "lettuce",
  },
];

interface SettingsState {
  theme: Theme;
  infiniteScroll: boolean;

  getAllThemes: () => Theme[];
  setTheme: (theme: Theme) => void;
  setInfiniteScroll: (infiniteScroll: boolean) => void;
}

const useSettings = create<SettingsState>((set, get) => ({
  theme:
    themes.find((t) => t.name === StorageService.getItem("theme")) || themes[0],
  infiniteScroll: StorageService.getItem("infiniteScroll") === "true" || false,

  getAllThemes: (): Theme[] => {
    return themes;
  },

  setTheme: (theme: Theme): void => {
    set((state) => ({ ...state, theme }));
    StorageService.setItem("theme", theme.name);
  },

  setInfiniteScroll: (infiniteScroll: boolean): void => {
    set((state) => ({ ...state, infiniteScroll }));
    StorageService.setItem("infiniteScroll", infiniteScroll);
  },
}));

export type { Theme, SettingsState };
export { useSettings };
