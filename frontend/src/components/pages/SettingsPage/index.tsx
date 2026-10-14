import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Checkbox } from "src/components/common/Checkbox";
import { Pills } from "src/components/common/Pills";
import { Radioboxes } from "src/components/common/Radioboxes";
import { ThemeSwitcher } from "src/components/common/ThemeSwitcher";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import type { MessageSettings as MessageSettingsData } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { useConfig } from "src/stores/config";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useSettings } from "src/stores/settings";
import { AutoPlaylistChoice, MarkdownPreviewMode } from "src/stores/settings";
import { useUser } from "src/stores/user";
import { resetQueries } from "src/utils/misc";

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

// The server settings mark each flag optional; fall back to the defaults so
// every key is a concrete boolean for the checkbox state.
const resolveEmailSettings = (
  settings: Partial<Record<EmailSettingKey, boolean>> | null | undefined,
): Record<EmailSettingKey, boolean> => {
  const keys = Object.keys(defaultEmailSettings) as EmailSettingKey[];
  return Object.fromEntries(
    keys.map((key) => [key, settings?.[key] ?? defaultEmailSettings[key]]),
  ) as Record<EmailSettingKey, boolean>;
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
  user: UserDetails | null;
  setUser: (user: UserDetails | null) => void;
}) => (
  <Checkbox
    label={label}
    checked={userSettings[settingKey]}
    onChange={(e) => {
      const updated = { ...userSettings, [settingKey]: e.target.checked };
      setUserSettings(updated);
      if (user) {
        UserService.update(user.id, { settings: updated }).then(setUser);
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
  const { user, setUser } = useUser();
  const [userSettings, setUserSettings] = useState<
    Record<EmailSettingKey, boolean>
  >(resolveEmailSettings(user?.settings));
  useEffect(() => {
    if (user?.settings) {
      setUserSettings(resolveEmailSettings(user.settings));
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

const MessageSettings = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const result = useQuery<MessageSettingsData, Error>({
    queryKey: queryKeys.messages.settings(),
    queryFn: MessageService.getSettings,
    enabled: !!user,
  });

  if (!user || !result.data) {
    return null;
  }

  const settings = result.data;
  const allowMessages = settings.allow_messages ?? true;
  const blockedUserIds = settings.blocked_users.map((blocked) => blocked.id);

  const save = async (allowMessages: boolean, userIds: number[]) => {
    await MessageService.updateSettings(allowMessages, userIds);
    await resetQueries(
      queryClient,
      [queryKeys.messages.settings(), queryKeys.users.all],
      true,
    );
  };

  return (
    <>
      <h2>Messages</h2>
      <Checkbox
        label='Disable messages (hides the "Send message" button from your profile)'
        checked={!allowMessages}
        onChange={(e) => {
          save(!e.target.checked, blockedUserIds);
        }}
      />

      {settings.blocked_users.length ? (
        <>
          <p>Blocked users:</p>
          <Pills
            source={settings.blocked_users}
            getKey={(blocked) => blocked.id}
            getText={(blocked) => blocked.username}
            onRemove={(blocked) => {
              save(
                allowMessages,
                blockedUserIds.filter((id) => id !== blocked.id),
              );
            }}
          />
        </>
      ) : (
        <p>
          Blocked users: nobody. Use the Block button on a user's profile to
          stop them from messaging you.
        </p>
      )}
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
  const { config } = useConfig();
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
      {config.features.messages && <MessageSettings />}
      <OtherSettings />
    </PlainLayout>
  );
};

export { SettingsPage };
