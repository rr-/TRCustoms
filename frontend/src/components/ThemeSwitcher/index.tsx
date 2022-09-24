import "./index.css";
import { useSettings } from "src/contexts/SettingsContext";
import type { Theme } from "src/contexts/SettingsContext";

interface ThemePreviewProps {
  theme: Theme;
}

const ThemePreview = ({ theme }: ThemePreviewProps) => {
  return (
    <div className="ThemePreview" data-theme={theme.stub}>
      <div className="ThemePreview--logo" />
      <div className="ThemePreview--nav"></div>
      <div className="ThemePreview--sidebar">
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
      </div>
      <div className="ThemePreview--main">
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-50" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-100" />
        <div className="ThemePreview--text text-50" />
      </div>
    </div>
  );
};

const ThemeSwitcher = () => {
  const { getAllThemes, setTheme } = useSettings();

  return (
    <ul className="ThemeSwitcher--list">
      {getAllThemes().map((theme) => (
        <li key={theme.name} className="ThemeSwitcher--listItem">
          <div
            role="button"
            onClick={() => setTheme(theme)}
            title={theme.name}
            className="ThemeSwitcher--label"
          >
            <div className="ThemeSwitcher--labelWrapper">
              <ThemePreview theme={theme} />
            </div>
            {theme.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

export { ThemeSwitcher };
