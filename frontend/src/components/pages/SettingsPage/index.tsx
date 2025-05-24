import { useContext, useState, useEffect } from "react";
import { Checkbox } from "src/components/common/Checkbox";
import { Radioboxes } from "src/components/common/Radioboxes";
import { ThemeSwitcher } from "src/components/common/ThemeSwitcher";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { useSettings } from "src/contexts/SettingsContext";
import {
  AutoPlaylistChoice,
  MarkdownPreviewMode,
} from "src/contexts/SettingsContext";
import { UserContext } from "src/contexts/UserContext";
import { UserService } from "src/services/UserService";

// Email notification settings configuration
const emailSettingsConfig = [
  { label: "Review posted", settingKey: "email_review_posted" },
  { label: "Rating posted", settingKey: "email_rating_posted" },
  { label: "Walkthrough posted", settingKey: "email_walkthrough_posted" },
  { label: "Review updated", settingKey: "email_review_updated" },
  { label: "Rating updated", settingKey: "email_rating_updated" },
  { label: "Walkthrough updated", settingKey: "email_walkthrough_updated" },
] as const;

type EmailSettingKey = (typeof emailSettingsConfig)[number]["settingKey"];

const defaultEmailSettings: Record<EmailSettingKey, boolean> = {
  email_review_posted: true,
  email_rating_posted: true,
  email_walkthrough_posted: true,
  email_review_updated: false,
  email_rating_updated: false,
  email_walkthrough_updated: false,
};

const EmailCheckbox = ({
  label,
  settingKey,
  userSettings,
  setUserSettings,
  user,
  setUser,
}: {
  label: string;
  settingKey: EmailSettingKey;
  userSettings: Record<EmailSettingKey, boolean>;
  setUserSettings: React.Dispatch<
    React.SetStateAction<Record<EmailSettingKey, boolean>>
  >;
  user: any;
  setUser: (usr: any) => void;
}) => (
  <Checkbox
    label={label}
    checked={userSettings[settingKey]}
    onChange={async (e) => {
      const updated = { ...userSettings, [settingKey]: e.target.checked };
      setUserSettings(updated);
      if (user) {
        const u = await UserService.update(user.id, { settings: updated });
        setUser(u);
      }
    }}
  />
);

const ThemeSettings = () => (
  <>
    <h2>Active theme</h2>
    <ThemeSwitcher />
  </>
);

const EmailSettings = () => {
  const { user, setUser } = useContext(UserContext);
  const [userSettings, setUserSettings] = useState<
    Record<EmailSettingKey, boolean>
  >(user?.settings ?? defaultEmailSettings);
  useEffect(() => {
    if (user?.settings) {
      setUserSettings(user.settings);
    }
  }, [user]);

  return (
    <>
      <h2>Email communication</h2>
      Your level(s):
      <br />
      {emailSettingsConfig.map(({ label, settingKey }) => (
        <EmailCheckbox
          key={settingKey}
          label={label}
          settingKey={settingKey}
          userSettings={userSettings}
          setUserSettings={setUserSettings}
          user={user}
          setUser={setUser}
        />
      ))}
    </>
  );
};

const OtherSettings = () => {
  const {
    infiniteScroll,
    setInfiniteScroll,
    markdownPreviewMode,
    setMarkdownPreviewMode,
    autoPlaylistChoice,
    setAutoPlaylistChoice,
  } = useSettings();

  return (
    <>
      <h2>Other settings</h2>

      <Checkbox
        label="Enable infinite scroll"
        checked={infiniteScroll}
        onChange={(e) => setInfiniteScroll(e.target.checked)}
      />

      <Checkbox
        label="Enable side-by-side Markdown preview"
        checked={markdownPreviewMode === MarkdownPreviewMode.SideBySide}
        onChange={(e) =>
          setMarkdownPreviewMode(
            markdownPreviewMode === MarkdownPreviewMode.Tabbed
              ? MarkdownPreviewMode.SideBySide
              : MarkdownPreviewMode.Tabbed,
          )
        }
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
    </>
  );
};

const SettingsPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Settings",
      description: "Manage the website's settings to your personal preference.",
    }),
    [],
  );

  return (
    <PlainLayout>
      <ThemeSettings />
      <EmailSettings />
      <OtherSettings />
    </PlainLayout>
  );
};

export { SettingsPage };
