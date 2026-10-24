import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { PagedDataList } from "src/components/common/DataList";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import { MessageCard } from "src/components/common/MessageCard";
import { MessagesSidebar } from "src/components/common/MessagesSidebar";
import { defaultThreadSearchQuery } from "src/components/common/MessagesSidebar";
import { threadSearchUrl } from "src/components/common/MessagesSidebar";
import { SectionHeader } from "src/components/common/Section";
import { MessageReplyForm } from "src/components/forms/MessageReplyForm";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { UserLink } from "src/components/links/UserLink";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import type { ThreadDetails } from "src/services/MessageService";
import type { ThreadMessagesSearchQuery } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import { queryKeys } from "src/services/queryKeys";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";
import { resetQueries } from "src/utils/misc";

const ThreadPage = () => {
  const { threadId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const messagesQuery: ThreadMessagesSearchQuery = {
    threadId: +threadId,
    page: +(searchParams.get("page") ?? "") || null,
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fetchUser } = useUser();

  const result = useQuery<ThreadDetails, Error>({
    queryKey: queryKeys.messages.thread(threadId),
    queryFn: async () => MessageService.getThread(+threadId),
  });

  useEffect(() => {
    if (result.dataUpdatedAt) {
      fetchUser();
    }
  }, [result.dataUpdatedAt, fetchUser]);

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.other_user
        ? `Conversation with ${result.data.other_user.username}`
        : "Messages",
    }),
    [result],
  );

  if (result.error) {
    return <ResponseErrorPage error={result.error} />;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const thread = result.data;
  const searchQuery = {
    ...defaultThreadSearchQuery,
    asAdministrator: thread.replies_as_administrator,
  };

  const handleMarkUnread = async () => {
    navigate(threadSearchUrl(searchQuery));
    await MessageService.markUnread(thread.id);
    await resetQueries(queryClient, [queryKeys.messages.lists], true);
    await fetchUser();
  };

  return (
    <SidebarLayout
      sidebar={
        <MessagesSidebar
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => navigate(threadSearchUrl(query))}
        />
      }
    >
      <SectionHeader>
        <span className={styles.header}>
          <span>
            Conversation with{" "}
            {thread.other_user ? (
              <UserLink user={thread.other_user} />
            ) : (
              "a deleted user"
            )}
            {thread.replies_as_administrator && <> (as Administration)</>}
          </span>
          {thread.can_mark_unread && (
            <Link className={styles.markUnread} onClick={handleMarkUnread}>
              Mark as unread
            </Link>
          )}
        </span>
      </SectionHeader>

      <PagedDataList
        queryKey={[...queryKeys.messages.thread(threadId), "messages"]}
        searchQuery={messagesQuery}
        searchFunc={MessageService.getThreadMessages}
        onSearchQueryChange={(query) =>
          navigate(
            typeof query.page === "number"
              ? `/messages/threads/${thread.id}?page=${query.page}`
              : `/messages/threads/${thread.id}`,
          )
        }
        itemKey={(message) => `${message.id}`}
        itemView={(message) => <MessageCard message={message} />}
        pageView={(children) => <div>{children}</div>}
      />

      {thread.can_reply ? (
        <MessageReplyForm
          thread={thread}
          onSubmit={() => navigate(`/messages/threads/${thread.id}`)}
        />
      ) : (
        <InfoMessage type={InfoMessageType.Info}>
          You can no longer reply to this conversation.
        </InfoMessage>
      )}
    </SidebarLayout>
  );
};

export { ThreadPage };
