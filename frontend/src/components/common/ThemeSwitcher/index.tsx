import styles from "./index.module.css";
import { ThemePreview } from "src/components/common/ThemePreview";
import { useSettings } from "src/contexts/SettingsContext";

const ThemeSwitcher = () => {
  const { getAllThemes, setTheme } = useSettings();

  return (
    <ul className={styles.list}>
      {getAllThemes().map((theme) => (
        <li key={theme.name} className={styles.listItem}>
          <div
            role="button"
            onClick={() => setTheme(theme)}
            title={theme.name}
            className={styles.label}
          >
            <div className={styles.labelWrapper}>
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
