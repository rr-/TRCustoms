import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useState } from "react";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Collapsible } from "src/components/common/Collapsible";
import { Pills } from "src/components/common/Pills";
import { Radioboxes } from "src/components/common/Radioboxes";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import type { MessageSettings as MessageSettingsData } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import type { UserNested } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { resetQueries } from "src/utils/misc";

const receivingOptions = [
  { id: true, name: "Enabled" },
  { id: false, name: "Disabled" },
];

const MessageSettings = () => {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<UserNested[]>([]);
  const result = useQuery<MessageSettingsData, Error>({
    queryKey: queryKeys.messages.settings(),
    queryFn: MessageService.getSettings,
  });
  const blockedUsers = result.data?.blocked_users;

  const handleSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      const response = await UserService.searchUsers({ search: userInput });
      setSuggestions(
        response.results.filter((user) =>
          (blockedUsers ?? []).every((blocked) => blocked.id !== user.id),
        ),
      );
    },
    [blockedUsers],
  );

  if (!result.data || !blockedUsers) {
    return null;
  }

  const allowMessages = result.data.allow_messages ?? true;
  const blockedUserIds = blockedUsers.map((blocked) => blocked.id);

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
      <SidebarBoxHeader alignToTabSwitch={false}>
        Messaging settings
      </SidebarBoxHeader>

      <div className={styles.section}>
        <Collapsible
          storageKey="messageSettingsReceiving"
          title="Receiving messages"
        >
          <Radioboxes
            options={receivingOptions}
            value={allowMessages}
            onChange={(value) => save(value, blockedUserIds)}
            getOptionId={(option) => option.id}
            getOptionName={(option) => option.name}
          />
        </Collapsible>
      </div>

      <div className={styles.section}>
        <Collapsible storageKey="messageSettingsBlockList" title="Block list">
          <AutoComplete
            placeholder="Start typing to search…"
            suggestions={suggestions}
            getResultText={(user) => user.username}
            getResultKey={(user) => user.id}
            onSearchTrigger={handleSearchTrigger}
            onResultApply={(user) =>
              save(allowMessages, [...blockedUserIds, user.id])
            }
          />
          <Pills
            source={blockedUsers}
            getKey={(blocked) => blocked.id}
            getText={(blocked) => blocked.username}
            onRemove={(blocked) =>
              save(
                allowMessages,
                blockedUserIds.filter((id) => id !== blocked.id),
              )
            }
          />
        </Collapsible>
      </div>
    </>
  );
};

export { MessageSettings };
