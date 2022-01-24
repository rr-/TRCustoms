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
    "positive-border-color": string;
    "neutral-border-color": string;
    "negative-border-color": string;
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
    "label-background-color": string;
    "navbar-primary-background-color": string;
    "navbar-primary-background-color-inside": string;
    "navbar-secondary-background-color": string;
    "navbar-secondary-background-color-inside": string;
    "navbar-secondary-active-tab-background-color": string;
    "navbar-secondary-active-tab-text-color": string;
    "navbar-primary-margin": string;
    "navbar-secondary-margin": string;
    "sidebar-background-color": string;
    "sidebar-padding": string;
    "text-color": string;
    "link-color": string;
    "link-highlight-background-color": string;
    "link-highlight-text-color": string;
    "link-text-decoration": string;
    "outline-color": string;
  };
}

const themes: Array<Theme> = [
  {
    name: "Lettuce",
    primaryColor: "yellowgreen",
    secondaryColor: "lemonchiffon",
    cssVariables: {
      "background-color": "lemonchiffon",
      "failure-text-color": "#f32d0a",
      "warning-text-color": "#9e921e",
      "success-text-color": "#1e921e",
      "positive-border-color": "#4cc24c",
      "neutral-border-color": "#cbc544",
      "negative-border-color": "#e0735f",
      "positive-background-color": "#c5f0ac",
      "neutral-background-color": "#ffe6aa",
      "negative-background-color": "#fed0d0",
      "input-background-color": "floralwhite",
      "input-border-color": "var(--button-background-color)",
      "input-invalid-border-color": "red",
      "button-background-color": "var(--navbar-primary-background-color)",
      "button-text-color": "var(--text-color)",
      "button-hovered-background-color":
        "var(--navbar-secondary-background-color)",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "underline",
      "label-background-color": "var(--navbar-secondary-background-color)",
      "navbar-primary-background-color": "yellowgreen",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "#c8ec85",
      "navbar-secondary-background-color-inside": "transparent",
      "navbar-secondary-active-tab-background-color": "var(--background-color)",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
      "navbar-primary-margin": "0",
      "navbar-secondary-margin": "0",
      "sidebar-background-color": "var(--navbar-secondary-background-color)",
      "sidebar-padding": "1rem",
      "text-color": "black",
      "link-color": "#1b5e60",
      "link-highlight-background-color":
        "var(--button-hovered-background-color)",
      "link-highlight-text-color": "var(--text-color)",
      "link-text-decoration": "underline",
      "outline-color": "var(--text-color)",
    },
  },

  {
    name: "Robotic",
    primaryColor: "white",
    secondaryColor: "red",
    cssVariables: {
      "background-color": "white",
      "failure-text-color": "firebrick",
      "warning-text-color": "darkorange",
      "success-text-color": "green",
      "positive-border-color": "#4cc24c",
      "neutral-border-color": "#cbc544",
      "negative-border-color": "#e0735f",
      "positive-background-color": "#c5f0ac",
      "neutral-background-color": "#efefd7",
      "negative-background-color": "#fed0d0",
      "input-background-color": "var(--background-color)",
      "input-border-color": "var(--button-background-color)",
      "input-invalid-border-color": "red",
      "button-background-color": "grey",
      "button-text-color": "white",
      "button-hovered-background-color": "silver",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "none",
      "label-background-color": "var(--navbar-secondary-background-color)",
      "navbar-primary-background-color": "transparent",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "transparent",
      "navbar-secondary-background-color-inside": "#EAEAEA",
      "navbar-primary-margin": "0.5rem 0",
      "navbar-secondary-margin": "0.5rem 0",
      "navbar-secondary-active-tab-background-color": "#DDD",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
      "sidebar-background-color": "transparent",
      "sidebar-padding": "0",
      "text-color": "black",
      "link-color": "red",
      "link-highlight-background-color":
        "var(--navbar-secondary-background-color-inside)",
      "link-highlight-text-color": "var(--text-color)",
      "link-text-decoration": "none",
      "outline-color": "var(--link-color)",
    },
  },

  {
    name: "Midnight ocean",
    primaryColor: "#20232e",
    secondaryColor: "#2196f3",
    cssVariables: {
      "background-color": "#20232e",
      "failure-text-color": "tomato",
      "warning-text-color": "yellow",
      "success-text-color": "limegreen",
      "positive-border-color": "#2f4323",
      "neutral-border-color": "#383824",
      "negative-border-color": "#5d2f2f",
      "positive-background-color": "#2f4323",
      "neutral-background-color": "#383824",
      "negative-background-color": "#5d2f2f",
      "input-background-color": "#a8c7e0",
      "input-border-color": "var(--button-background-color)",
      "input-invalid-border-color": "red",
      "button-background-color": "#1e67a1",
      "button-text-color": "white",
      "button-hovered-background-color": "var(--button-background-color)",
      "button-hovered-text-color": "var(--button-text-color)",
      "button-text-decoration": "none",
      "label-background-color": "var(--navbar-secondary-background-color)",
      "navbar-primary-background-color": "transparent",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "transparent",
      "navbar-secondary-background-color-inside": "#171720",
      "navbar-primary-margin": "0.5rem 0",
      "navbar-secondary-margin": "0.5rem 0",
      "navbar-secondary-active-tab-background-color": "#1c3160",
      "navbar-secondary-active-tab-text-color": "#d0e6ed",
      "sidebar-background-color":
        "var(--navbar-secondary-background-color-inside)",
      "sidebar-padding": "1rem",
      "text-color": "#ededed",
      "link-color": "#2196f3",
      "link-highlight-background-color": "#1c3160",
      "link-highlight-text-color": "#d0e6ed",
      "link-text-decoration": "none",
      "outline-color": "var(--link-color)",
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
