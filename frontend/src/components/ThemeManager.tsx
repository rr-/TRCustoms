import "./ThemeManager.css";
import { useCallback } from "react";
import { useEffect } from "react";
import { createLocalStorageStateHook } from "use-local-storage-state";

interface Theme {
  name: string;
  stub: string;
}

const themes: Array<Theme> = [
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

const useTheme = createLocalStorageStateHook("theme", themes[0].name);

const getAllThemes = () => {
  return themes;
};

const ThemeManager = () => {
  const [activeThemeName, setActiveThemeName] = useTheme();

  const getActiveTheme = useCallback((): Theme => {
    return themes.find((theme) => theme.name === activeThemeName) || themes[0];
  }, [activeThemeName]);

  const applyTheme = useCallback(
    (theme: Theme) => {
      document.documentElement.dataset.theme = theme.stub;
      if (theme.name !== getActiveTheme().name) {
        setActiveThemeName(theme.name);
      }
    },
    [getActiveTheme, setActiveThemeName]
  );

  useEffect(() => {
    const theme = getActiveTheme();
    applyTheme(theme);
  }, [getActiveTheme, applyTheme]);

  return <></>;
};

export { useTheme, getAllThemes, ThemeManager };
