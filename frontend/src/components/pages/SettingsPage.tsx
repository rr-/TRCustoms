import "./SettingsPage.css";
import { useEffect } from "react";
import { useContext } from "react";
import { Checkbox } from "src/components/Checkbox";
import { useSettings } from "src/contexts/SettingsContext";
import { TitleContext } from "src/contexts/TitleContext";

const SettingsPage = () => {
  const {
    infiniteScroll,
    setInfiniteScroll,
    getAllThemes,
    setTheme,
  } = useSettings();
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Settings");
  }, [setTitle]);

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
              onClick={() => setTheme(theme)}
            >
              <span
                className="SettingsPage--label"
                data-theme={theme.stub}
              ></span>
              {theme.name}
            </button>
          </li>
        ))}
      </ul>

      <h2>Other settings</h2>

      <Checkbox
        label="Enable infinite scroll"
        onChange={(e) => setInfiniteScroll(e.target.checked)}
        checked={infiniteScroll}
      />
    </div>
  );
};

export { SettingsPage };
