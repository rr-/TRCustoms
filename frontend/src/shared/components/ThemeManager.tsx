const themes = {
  lettuce: {
    "background-color": "lemonchiffon",
    "outline-color": "black",
    "input-background-color": "floralwhite",
    "input-border-color": "yellowgreen",
    "button-background-color": "yellowgreen",
    "button-text-color": "black",
    "button-focused-background-color": "#c8ec85",
    "button-focused-text-color": "black",
    "button-text-decoration": "underline",
    "navbar-primary-background-color": "yellowgreen",
    "navbar-primary-background-color-inside": "transparent",
    "navbar-secondary-background-color": "#c8ec85",
    "navbar-secondary-background-color-inside": "transparent",
    "navbar-secondary-active-tab-background-color": "lemonchiffon",
    "navbar-secondary-active-tab-text-color": "black",
    "navbar-primary-margin": "0",
    "navbar-secondary-margin": "0",
    "text-color": "black",
    "link-color": "#1b5e60",
    "link-highlight-color": "#c8ec85",
    "link-text-decoration": "underline",
  },
  bw: {
    "background-color": "white",
    "outline-color": "red",
    "input-background-color": "white",
    "input-border-color": "grey",
    "button-background-color": "grey",
    "button-text-color": "white",
    "button-focused-background-color": "silver",
    "button-focused-text-color": "black",
    "button-text-decoration": "none",
    "navbar-primary-background-color": "transparent",
    "navbar-primary-background-color-inside": "transparent",
    "navbar-secondary-background-color": "transparent",
    "navbar-secondary-background-color-inside": "#EAEAEA",
    "navbar-primary-margin": "0.5rem 0",
    "navbar-secondary-margin": "0.5rem 0",
    "navbar-secondary-active-tab-background-color": "#DDD",
    "navbar-secondary-active-tab-text-color": "black",
    "text-color": "black",
    "link-color": "red",
    "link-highlight-color": "#EAEAEA",
    "link-text-decoration": "none",
  },
};

const ThemeManager: React.FunctionComponent = () => {
  const activeTheme = "lettuce";
  const theme = themes[activeTheme];

  for (const [key, value] of Object.entries(theme)) {
    const cssKey = `--${key}`;
    const cssValue = value;
    document.body.style.setProperty(cssKey, cssValue);
  }

  return null;
};

export { ThemeManager };
