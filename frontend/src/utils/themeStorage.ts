interface Theme {
  name: string;
  stub: string;
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

const resolveStoredTheme = (storedTheme: string | null): Theme => {
  return (
    themes.find((theme) => {
      return theme.stub === storedTheme || theme.name === storedTheme;
    }) || themes[0]
  );
};

export type { Theme };
export { themes, resolveStoredTheme };
