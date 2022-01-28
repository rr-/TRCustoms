import "./SettingsPage.css";
import { Checkbox } from "src/shared/components/Checkbox";
import { useInfiniteScroll } from "src/shared/components/DataTable";
import { getAllThemes } from "src/shared/components/ThemeManager";
import { useTheme } from "src/shared/components/ThemeManager";

const SettingsPage = () => {
  const [, setTheme] = useTheme();
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useInfiniteScroll();

  return (
    <div className="SettingsPage">
      <h2>Active theme</h2>
      <ul className="SettingsPage--list">
        {getAllThemes().map((theme) => (
          <li key={theme.name} className="SettingsPage--listItem">
            <button
              type="button"
              title={theme.name}
              className="link SettingsPage--switch"
              onClick={() => setTheme(theme.name)}
            >
              <span
                className="SettingsPage--label"
                style={{
                  borderTopColor: theme.primaryColor,
                  borderLeftColor: theme.primaryColor,
                  borderRightColor: theme.secondaryColor,
                  borderBottomColor: theme.secondaryColor,
                }}
              ></span>
              {theme.name}
            </button>
          </li>
        ))}
      </ul>

      <h2>Other settings</h2>

      <Checkbox
        label="Enable infinite scroll"
        onChange={(e) => setEnableInfiniteScroll(e.target.checked)}
        checked={enableInfiniteScroll}
      />
    </div>
  );
};

export { SettingsPage };
