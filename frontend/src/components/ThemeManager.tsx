import { useCallback } from "react";
import { useEffect } from "react";
import { createLocalStorageStateHook } from "use-local-storage-state";

interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  cssVariables: {
    "background-color": string;
    "failure-text-color": string;
    "warning-text-color": string;
    "success-text-color": string;
    "positive-background-color": string;
    "neutral-background-color": string;
    "negative-background-color": string;
    "input-background-color": string;
    "input-border-color": string;
    "input-invalid-border-color": string;
    "button-background-color": string;
    "button-text-color": string;
    "button-hovered-background-color": string;
    "button-hovered-text-color": string;
    "button-text-decoration": string;
    "label-backgrounds": string;
    "label-background-color": string;
    "tab-switch-active-background-color": string;
    "tab-switch-inactive-background-color": string;
    "tab-switch-active-text-color": string;
    "tab-switch-inactive-text-color": string;
    "navbar-primary-background-color": string;
    "navbar-secondary-background-color": string;
    "navbar-secondary-active-tab-background-color": string;
    "navbar-secondary-active-tab-text-color": string;
    "sidebar-background-color": string;
    "sidebar-padding": string;
    "levels-table-background-color": string;
    "levels-table-padding": string;
    "reviews-table-background-color": string;
    "table-details-background-color": string;
    "section-background-color": string;
    "section-padding": string;
    "text-color": string;
    "link-color": string;
    "link-highlight-background-color": string;
    "link-highlight-text-color": string;
    "link-text-decoration": string;
    "outline-color": string;
    "stats-positive-bar-color": string;
    "stats-neutral-bar-color": string;
    "stats-negative-bar-color": string;
  };
}

const baseVariables = {
  "input-border-color": "var(--button-background-color)",
  "input-invalid-border-color": "red",
  "tab-switch-active-background-color":
    "var(--navbar-secondary-active-tab-background-color)",
  "tab-switch-inactive-background-color": "var(--label-background-color)",
  "tab-switch-active-text-color":
    "var(--navbar-secondary-active-tab-text-color)",
  "tab-switch-inactive-text-color": "var(--text-color)",
  "navbar-primary-background-color": "transparent",
};

const themes: Array<Theme> = [
  {
    name: "Midnight ocean",
    primaryColor: "#20232e",
    secondaryColor: "#2196f3",
    cssVariables: {
      ...baseVariables,
      "background-color": "#20232e",
      "failure-text-color": "tomato",
      "warning-text-color": "yellow",
      "success-text-color": "limegreen",
      "positive-background-color": "#213913",
      "neutral-background-color": "#3c3c17",
      "negative-background-color": "#4d1f1f",
      "input-background-color": "#a8c7e0",
      "button-background-color": "#1e67a1",
      "button-text-color": "white",
      "button-hovered-background-color": "#2f7ab6",
      "button-hovered-text-color": "var(--button-text-color)",
      "button-text-decoration": "none",
      "label-backgrounds": "1",
      "label-background-color": "var(--navbar-secondary-background-color)",
      "navbar-secondary-background-color": "#171720",
      "navbar-secondary-active-tab-background-color": "#1c3160",
      "navbar-secondary-active-tab-text-color": "#d0e6ed",
      "sidebar-background-color": "var(--navbar-secondary-background-color)",
      "sidebar-padding": "1",
      "levels-table-background-color":
        "var(--navbar-secondary-background-color)",
      "levels-table-padding": "1",
      "reviews-table-background-color": "var(--sidebar-background-color)",
      "table-details-background-color": "var(--sidebar-background-color)",
      "section-background-color": "transparent",
      "section-padding": "0",
      "text-color": "#ededed",
      "link-color": "#2196f3",
      "link-highlight-background-color": "#1c3160",
      "link-highlight-text-color": "#d0e6ed",
      "link-text-decoration": "none",
      "outline-color": "var(--link-color)",
      "stats-positive-bar-color": "#538f38",
      "stats-neutral-bar-color": "#7b6032",
      "stats-negative-bar-color": "#a62626",
    },
  },

  {
    name: "Robotic",
    primaryColor: "white",
    secondaryColor: "red",
    cssVariables: {
      ...baseVariables,
      "background-color": "white",
      "failure-text-color": "firebrick",
      "warning-text-color": "darkorange",
      "success-text-color": "green",
      "positive-background-color": "#c5f0ac",
      "neutral-background-color": "#efefd7",
      "negative-background-color": "#fed0d0",
      "input-background-color": "var(--background-color)",
      "button-background-color": "grey",
      "button-text-color": "white",
      "button-hovered-background-color": "silver",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "none",
      "label-backgrounds": "1",
      "label-background-color": "var(--navbar-secondary-background-color)",
      "navbar-secondary-background-color": "#EAEAEA",
      "navbar-secondary-active-tab-background-color": "#DDD",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
      "sidebar-background-color": "transparent",
      "sidebar-padding": "0",
      "levels-table-background-color": "var(--background-color)",
      "levels-table-padding": "0",
      "reviews-table-background-color": "var(--sidebar-background-color)",
      "table-details-background-color": "var(--sidebar-background-color)",
      "section-background-color": "transparent",
      "section-padding": "0",
      "text-color": "black",
      "link-color": "red",
      "link-highlight-background-color":
        "var(--navbar-secondary-background-color)",
      "link-highlight-text-color": "var(--text-color)",
      "link-text-decoration": "none",
      "outline-color": "var(--link-color)",
      "stats-positive-bar-color": "var(--link-color)",
      "stats-neutral-bar-color": "var(--link-color)",
      "stats-negative-bar-color": "var(--link-color)",
    },
  },

  {
    name: "Lettuce",
    primaryColor: "yellowgreen",
    secondaryColor: "lemonchiffon",
    cssVariables: {
      ...baseVariables,
      "background-color": "lemonchiffon",
      "failure-text-color": "#f32d0a",
      "warning-text-color": "#9e921e",
      "success-text-color": "#1e921e",
      "positive-background-color": "#78cf2f",
      "neutral-background-color": "#b1a338",
      "negative-background-color": "#f38561",
      "input-background-color": "floralwhite",
      "button-background-color": "yellowgreen",
      "button-text-color": "var(--text-color)",
      "button-hovered-background-color": "var(--label-background-color)",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "underline",
      "label-backgrounds": "1",
      "label-background-color": "#c8ec85",
      "navbar-secondary-background-color": "yellowgreen",
      "navbar-secondary-active-tab-background-color":
        "var(--label-background-color)",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
      "sidebar-background-color": "transparent",
      "sidebar-padding": "0",
      "levels-table-background-color": "var(--section-background-color)",
      "levels-table-padding": "1",
      "reviews-table-background-color": "var(--background-color)",
      "table-details-background-color": "var(--section-background-color)",
      "section-background-color": "var(--label-background-color)",
      "section-padding": "1",
      "text-color": "black",
      "link-color": "#1b5e60",
      "link-highlight-background-color":
        "var(--button-hovered-background-color)",
      "link-highlight-text-color": "var(--text-color)",
      "link-text-decoration": "underline",
      "outline-color": "var(--text-color)",
      "stats-positive-bar-color": "var(--positive-background-color)",
      "stats-neutral-bar-color": "var(--neutral-background-color)",
      "stats-negative-bar-color": "var(--negative-background-color)",
      "tab-switch-active-background-color": "var(--button-background-color)",
    },
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
      for (const [key, value] of Object.entries(theme.cssVariables)) {
        const cssKey = `--${key}`;
        const cssValue = value;
        document.body.style.setProperty(cssKey, cssValue);
      }
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
