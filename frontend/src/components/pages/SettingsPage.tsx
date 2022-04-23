import "./SettingsPage.css";
import { useEffect } from "react";
import { useContext } from "react";
import { Checkbox } from "src/components/Checkbox";
import { ThemeSwitcher } from "src/components/ThemeSwitcher";
import { useSettings } from "src/contexts/SettingsContext";
import { TitleContext } from "src/contexts/TitleContext";

const SettingsPage = () => {
  const { infiniteScroll, setInfiniteScroll } = useSettings();
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Settings");
  }, [setTitle]);

  return (
    <div className="SettingsPage">
      <h2>Active theme</h2>
      <ThemeSwitcher />

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
