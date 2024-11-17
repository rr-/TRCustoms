import { Checkbox } from "src/components/common/Checkbox";
import { Radioboxes } from "src/components/common/Radioboxes";
import { ThemeSwitcher } from "src/components/common/ThemeSwitcher";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { useSettings } from "src/contexts/SettingsContext";
import { AutoPlaylistChoice } from "src/contexts/SettingsContext";
import { MarkdownPreviewMode } from "src/contexts/SettingsContext";

const SettingsPage = () => {
  const {
    infiniteScroll,
    setInfiniteScroll,
    markdownPreviewMode,
    setMarkdownPreviewMode,
    autoPlaylistChoice,
    setAutoPlaylistChoice,
  } = useSettings();

  usePageMetadata(
    () => ({
      ready: true,
      title: "Settings",
      description: "Manage the website's settings to your personal preference.",
    }),
    []
  );

  return (
    <PlainLayout>
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

      <br />
      <Radioboxes
        header="Mark reviewed/rated levels as finished"
        options={[
          { id: AutoPlaylistChoice.Ask, name: "Ask" },
          { id: AutoPlaylistChoice.No, name: "Never" },
          { id: AutoPlaylistChoice.Yes, name: "Always" },
        ]}
        value={autoPlaylistChoice}
        onChange={setAutoPlaylistChoice}
        getOptionId={(option) => option.id}
        getOptionName={(option) => option.name}
      />
    </PlainLayout>
  );
};

export { SettingsPage };
