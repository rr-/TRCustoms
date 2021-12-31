import "./SettingsPage.css";
import { useInfiniteScroll } from "src/shared/components/DataTable";
import { useTheme, getAllThemes } from "src/shared/components/ThemeManager";

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

      <label>
        <input
          type="checkbox"
          onChange={(e) => setEnableInfiniteScroll(e.target.checked)}
          checked={enableInfiniteScroll}
        />
        Enable infinite scroll
      </label>
    </div>
  );
};

export default SettingsPage;
