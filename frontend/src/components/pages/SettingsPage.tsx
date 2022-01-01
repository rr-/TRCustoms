import "./SettingsPage.css";
import { useTheme, getAllThemes } from "src/shared/components/ThemeManager";

const SettingsPage = () => {
  const [, setTheme] = useTheme();

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
    </div>
  );
};

export default SettingsPage;
