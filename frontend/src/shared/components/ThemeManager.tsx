import "./ThemeManager.css";
import { useEffect } from "react";
import { useState } from "react";

interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  cssVariables: {
    "background-color": string;
    "input-background-color": string;
    "input-border-color": string;
    "button-background-color": string;
    "button-text-color": string;
    "button-hovered-background-color": string;
    "button-hovered-text-color": string;
    "button-text-decoration": string;
    "navbar-primary-background-color": string;
    "navbar-primary-background-color-inside": string;
    "navbar-secondary-background-color": string;
    "navbar-secondary-background-color-inside": string;
    "navbar-secondary-active-tab-background-color": string;
    "navbar-secondary-active-tab-text-color": string;
    "navbar-primary-margin": string;
    "navbar-secondary-margin": string;
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
      "input-background-color": "floralwhite",
      "input-border-color": "var(--button-background-color)",
      "button-background-color": "var(--navbar-primary-background-color)",
      "button-text-color": "var(--text-color)",
      "button-hovered-background-color":
        "var(--navbar-secondary-background-color)",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "underline",
      "navbar-primary-background-color": "yellowgreen",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "#c8ec85",
      "navbar-secondary-background-color-inside": "transparent",
      "navbar-secondary-active-tab-background-color": "var(--background-color)",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
      "navbar-primary-margin": "0",
      "navbar-secondary-margin": "0",
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
      "input-background-color": "var(--background-color)",
      "input-border-color": "var(--button-background-color)",
      "button-background-color": "grey",
      "button-text-color": "white",
      "button-hovered-background-color": "silver",
      "button-hovered-text-color": "var(--text-color)",
      "button-text-decoration": "none",
      "navbar-primary-background-color": "transparent",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "transparent",
      "navbar-secondary-background-color-inside": "#EAEAEA",
      "navbar-primary-margin": "0.5rem 0",
      "navbar-secondary-margin": "0.5rem 0",
      "navbar-secondary-active-tab-background-color": "#DDD",
      "navbar-secondary-active-tab-text-color": "var(--text-color)",
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
      "input-background-color": "#a8c7e0",
      "input-border-color": "var(--button-background-color)",
      "button-background-color": "#1e67a1",
      "button-text-color": "white",
      "button-hovered-background-color": "var(--button-background-color)",
      "button-hovered-text-color": "var(--button-text-color)",
      "button-text-decoration": "none",
      "navbar-primary-background-color": "transparent",
      "navbar-primary-background-color-inside": "transparent",
      "navbar-secondary-background-color": "transparent",
      "navbar-secondary-background-color-inside": "#171720",
      "navbar-primary-margin": "0.5rem 0",
      "navbar-secondary-margin": "0.5rem 0",
      "navbar-secondary-active-tab-background-color": "#1c3160",
      "navbar-secondary-active-tab-text-color": "#d0e6ed",
      "text-color": "#ededed",
      "link-color": "#2196f3",
      "link-highlight-background-color": "#1c3160",
      "link-highlight-text-color": "#d0e6ed",
      "link-text-decoration": "none",
      "outline-color": "var(--link-color)",
    },
  },
];

const ThemeManager = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>(
    themes.find((theme) => theme.name === localStorage.getItem("theme")) ||
      themes[0]
  );

  useEffect(() => {
    for (const [key, value] of Object.entries(activeTheme.cssVariables)) {
      const cssKey = `--${key}`;
      const cssValue = value;
      document.body.style.setProperty(cssKey, cssValue);
    }
    localStorage.setItem("theme", activeTheme.name);
  }, [activeTheme]);

  return (
    <div className="ThemeManager">
      <ul className="ThemeManager--list">
        {themes.map((theme) => (
          <li key={theme.name} className="ThemeManager--listItem">
            <button
              type="button"
              className="ThemeManager--switch"
              title={theme.name}
              onClick={() => setActiveTheme(theme)}
              style={{
                borderTopColor: theme.primaryColor,
                borderLeftColor: theme.primaryColor,
                borderRightColor: theme.secondaryColor,
                borderBottomColor: theme.secondaryColor,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export { ThemeManager };
