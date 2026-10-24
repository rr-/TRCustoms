import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { Link } from "src/components/common/Link";
import { MessagesSidebar } from "src/components/common/MessagesSidebar";
import { deserializeThreadSearchQuery } from "src/components/common/MessagesSidebar";
import { threadSearchUrl } from "src/components/common/MessagesSidebar";
import { UserPicture } from "src/components/common/UserPicture";
import { IconReply } from "src/components/icons";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { Error403Page } from "src/components/pages/ErrorPage";
import type { ThreadListing } from "src/services/MessageService";
import type { ThreadSearchQuery } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import { queryKeys } from "src/services/queryKeys";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";
import { formatDateTime } from "src/utils/string";
import { markdownToPlainText } from "src/utils/string";

const unreadClassName = (thread: ThreadListing) =>
  thread.has_unread ? styles.unread : undefined;

const columns: DataTableColumn<ThreadListing>[] = [
  {
    name: "marker",
    label: "",
    className: styles.marker,
    itemElement: ({ item }) =>
      item.has_unread ? (
        <span className={styles.dot} aria-label="Unread" />
      ) : (
        item.last_message_is_own && (
          <span className={styles.replied} title="Replied">
            <IconReply />
          </span>
        )
      ),
  },
  {
    name: "contact",
    label: "Contact",
    className: styles.contact,
    itemElement: ({ item }) => (
      <span className={unreadClassName(item)}>
        <Link to={`/messages/threads/${item.id}`}>
          {item.other_user && <UserPicture user={item.other_user} />}
          {item.other_user?.username ?? "a deleted user"}
        </Link>
      </span>
    ),
  },
  {
    name: "lastMessage",
    label: "Last message",
    className: styles.lastMessage,
    itemElement: ({ item }) => (
      <span className={unreadClassName(item)}>
        <Link to={`/messages/threads/${item.id}`}>
          {markdownToPlainText(item.last_message_text)}
        </Link>
      </span>
    ),
  },
  {
    name: "date",
    label: "Last message date",
    className: styles.date,
    itemElement: ({ item }) => formatDateTime(item.last_message_at),
  },
];

const MessagesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = deserializeThreadSearchQuery(
    Object.fromEntries(searchParams),
  );
  const setSearchQuery = (query: ThreadSearchQuery) =>
    navigate(threadSearchUrl(query));

  usePageMetadata(() => ({ ready: true, title: "Messages" }), []);

  if (!user) {
    return <Error403Page />;
  }

  return (
    <SidebarLayout
      sidebar={
        <MessagesSidebar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      }
    >
      <DataTable
        className={styles.table}
        queryKey={queryKeys.messages.lists}
        columns={columns}
        itemKey={(thread) => `${thread.id}`}
        searchQuery={searchQuery}
        searchFunc={MessageService.searchThreads}
        onSearchQueryChange={setSearchQuery}
        noItemsElement={<p>There are no messages here.</p>}
      />
    </SidebarLayout>
  );
};

export { MessagesPage };
