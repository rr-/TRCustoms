import styles from "./index.module.css";
import { Link } from "react-router-dom";
import { UserPicture } from "src/components/common/UserPicture";
import { IconReply } from "src/components/icons";
import type { MessageListing } from "src/services/MessageService";
import { MessageBox } from "src/services/MessageService";
import { formatDateTime } from "src/utils/string";
import { markdownToPlainText } from "src/utils/string";

interface MessageRowProps {
  message: MessageListing;
  box: MessageBox;
}

const MessageRow = ({ message, box }: MessageRowProps) => {
  const isInbox = box === MessageBox.Inbox;
  const person = isInbox ? message.sender : message.receiver;
  const isUnread = isInbox && !message.is_read;

  return (
    <Link
      to={`/messages/threads/${message.thread_id}/${message.id}`}
      className={`${styles.row} ${isUnread ? styles.unread : ""}`}
    >
      <span className={styles.marker}>
        {isUnread ? (
          <span className={styles.dot} aria-label="Unread" />
        ) : (
          isInbox &&
          message.is_replied && (
            <span className={styles.replied} title="Replied">
              <IconReply />
            </span>
          )
        )}
      </span>
      <span className={styles.person}>
        {person && <UserPicture user={person} />}
        {!isInbox && "To: "}
        {person?.username ?? "a deleted user"}
      </span>
      <span className={styles.summary}>
        {message.subject}
        <span className={styles.preview}>
          {markdownToPlainText(message.text)}
        </span>
      </span>
      <span className={styles.date}>{formatDateTime(message.created)}</span>
    </Link>
  );
};

export { MessageRow };
