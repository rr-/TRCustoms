import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { DataList } from "src/components/common/DataList";
import { hasPermission } from "src/components/common/PermissionGuard";
import { LightTabSwitch } from "src/components/common/TabSwitch";
import type { TabPage } from "src/components/common/TabSwitch";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { Error403Page } from "src/components/pages/ErrorPage";
import { MessageRow } from "src/components/pages/MessagesPage/MessageRow";
import type { MessageListing } from "src/services/MessageService";
import type { MessageSearchQuery } from "src/services/MessageService";
import { MessageBox } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import { UserPermission } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";

interface MessageListProps {
  box: MessageBox;
  asAdministrator: boolean;
}

const MessageList = ({ box, asAdministrator }: MessageListProps) => {
  const [searchQuery, setSearchQuery] = useState<MessageSearchQuery>({
    page: null,
    box,
    asAdministrator,
  });

  return (
    <DataList
      queryKey={queryKeys.messages.lists}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchFunc={MessageService.searchMessages}
      itemKey={(message: MessageListing) => message.id.toString()}
      itemView={(message: MessageListing) => (
        <MessageRow message={message} box={box} />
      )}
      noItemsElement={<p>There are no messages here.</p>}
    />
  );
};

const MessagesPage = () => {
  const { tabName = "inbox" } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  usePageMetadata(() => ({ ready: true, title: "Messages" }), []);

  if (!user) {
    return <Error403Page />;
  }

  const tabs: TabPage[] = [
    {
      name: "inbox",
      label: "Inbox",
      content: <MessageList box={MessageBox.Inbox} asAdministrator={false} />,
    },
    {
      name: "outbox",
      label: "Outbox",
      content: <MessageList box={MessageBox.Outbox} asAdministrator={false} />,
    },
  ];
  if (hasPermission(user, UserPermission.messageAsAdministrator)) {
    tabs.push(
      {
        name: "administrator-inbox",
        label: "Administrator inbox",
        content: <MessageList box={MessageBox.Inbox} asAdministrator={true} />,
      },
      {
        name: "administrator-outbox",
        label: "Administrator outbox",
        content: <MessageList box={MessageBox.Outbox} asAdministrator={true} />,
      },
    );
  }

  const handleTabChange = (tab: TabPage) => {
    navigate(tab.name === "inbox" ? "/messages" : `/messages/${tab.name}`);
  };

  return (
    <PlainLayout header="Messages">
      <LightTabSwitch
        tabs={tabs}
        tabName={tabs.some((tab) => tab.name === tabName) ? tabName : "inbox"}
        onTabChange={handleTabChange}
      />
    </PlainLayout>
  );
};

export { MessagesPage };
