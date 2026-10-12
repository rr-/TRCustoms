import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Link } from "src/components/common/Link";
import { Loader } from "src/components/common/Loader";
import { MessageCard } from "src/components/common/MessageCard";
import { MessageReplyForm } from "src/components/forms/MessageReplyForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { UserLink } from "src/components/links/UserLink";
import { UserPicLink } from "src/components/links/UserPicLink";
import { Markdown } from "src/components/markdown/Markdown";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import type { Message } from "src/services/MessageService";
import type { ThreadDetails } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import { queryKeys } from "src/services/queryKeys";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";
import { resetQueries } from "src/utils/misc";
import { formatDateTime } from "src/utils/string";

const QUOTE_COLORS = [
  "var(--link-color)",
  "var(--failure-fg-color)",
  "var(--success-fg-color)",
  "var(--warning-fg-color)",
];

interface QuoteTrailProps {
  messages: Message[];
  depth: number;
}

const QuoteTrail = ({ messages, depth }: QuoteTrailProps) => {
  const [message, ...older] = messages;
  return (
    <>
      <div className={styles.attribution}>
        <UserPicLink user={message.sender} fallback="A deleted user" />
        <span>{formatDateTime(message.created)}</span>
      </div>
      <Markdown allowColors={false}>{message.text}</Markdown>
      {older.length > 0 && (
        <div
          className={styles.quote}
          style={
            {
              "--quote-color": QUOTE_COLORS[depth % QUOTE_COLORS.length],
            } as React.CSSProperties
          }
        >
          <QuoteTrail messages={older} depth={depth + 1} />
        </div>
      )}
    </>
  );
};

const ThreadPage = () => {
  const { threadId = "", messageId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fetchUser } = useUser();
  const [showTrail, setShowTrail] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

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
      title: result.data?.subject ?? "Messages",
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
  const focusIndex = Math.max(
    0,
    thread.messages.findIndex((message) => String(message.id) === messageId),
  );
  const focus = thread.messages[focusIndex];
  const newerCount = focusIndex;
  const isReceived = !!focus && focus.sender?.id === thread.other_user?.id;

  const handleMarkUnread = async () => {
    navigate(
      thread.replies_as_administrator
        ? "/messages/administration-inbox"
        : "/messages",
    );
    await MessageService.markUnread(focus.id);
    await resetQueries(queryClient, [queryKeys.messages.lists], true);
    await fetchUser();
  };
  const older = thread.messages.slice(focusIndex + 1);

  return (
    <PlainLayout
      header={thread.subject}
      subheader={
        <>
          Conversation with{" "}
          {thread.other_user ? (
            <UserLink user={thread.other_user} />
          ) : (
            "a deleted user"
          )}
          {thread.replies_as_administrator && <> (as Administration)</>}
        </>
      }
    >
      {newerCount > 0 && (
        <InfoMessage type={InfoMessageType.Info}>
          <span>
            There{" "}
            {newerCount === 1
              ? "is 1 newer message"
              : `are ${newerCount} newer messages`}{" "}
            in this conversation.{" "}
            <Link to={`/messages/threads/${thread.id}`}>Show the latest</Link>
          </span>
        </InfoMessage>
      )}

      {!thread.can_reply && (
        <InfoMessage type={InfoMessageType.Info}>
          You can no longer reply to this conversation.
        </InfoMessage>
      )}

      {focus && (
        <MessageCard
          message={focus}
          trail={
            older.length > 0 && (
              <>
                <button
                  type="button"
                  className={styles.trailToggle}
                  aria-label={
                    showTrail
                      ? "Hide earlier messages"
                      : "Show earlier messages"
                  }
                  aria-expanded={showTrail}
                  onClick={() => setShowTrail(!showTrail)}
                >
                  …
                </button>
                {showTrail && (
                  <div className={styles.trail}>
                    <QuoteTrail messages={older} depth={0} />
                  </div>
                )}
              </>
            )
          }
          footer={
            <span className={styles.actions}>
              {thread.can_reply && !isReplying && (
                <Link onClick={() => setIsReplying(true)}>Reply</Link>
              )}
              {isReceived && (
                <Link onClick={handleMarkUnread}>Mark as unread</Link>
              )}
            </span>
          }
        />
      )}

      {isReplying && (
        <div className={styles.replyForm}>
          <MessageReplyForm
            thread={thread}
            onCancel={() => setIsReplying(false)}
            onSubmit={() => {
              setIsReplying(false);
              navigate(`/messages/threads/${thread.id}`);
            }}
          />
        </div>
      )}
    </PlainLayout>
  );
};

export { ThreadPage };
