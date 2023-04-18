import "./index.css";
import { Checkbox } from "src/components/common/Checkbox";
import { ThemeSwitcher } from "src/components/common/ThemeSwitcher";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { useSettings } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";

const SettingsPage = () => {
  const { infiniteScroll, setInfiniteScroll } = useSettings();
  const { markdownPreviewMode, setMarkdownPreviewMode } = useSettings();

  usePageMetadata(() => ({ ready: true, title: "Settings" }), []);

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

      <Checkbox
        label="Enable side-by-side Markdown preview"
        onChange={(e) =>
          setMarkdownPreviewMode(
            markdownPreviewMode === MarkdownPreviewMode.Tabbed
              ? MarkdownPreviewMode.SideBySide
              : MarkdownPreviewMode.Tabbed
          )
        }
        checked={markdownPreviewMode === MarkdownPreviewMode.SideBySide}
      />
    </div>
  );
};

export { SettingsPage };
