import styles from "./index.module.css";
import { UserPicLink } from "src/components/links/UserPicLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { Message } from "src/services/MessageService";
import { formatDateTime } from "src/utils/string";

interface MessageCardProps {
  message: Message;
  trail?: React.ReactNode;
  footer?: React.ReactNode;
}

const MessageCard = ({ message, trail, footer }: MessageCardProps) => {
  return (
    <article className={styles.wrapper} id={`message-${message.id}`}>
      <header className={styles.header}>
        <strong>
          <UserPicLink user={message.sender} fallback="A deleted user" />
        </strong>
        <span>{formatDateTime(message.created)}</span>
      </header>
      <div className={styles.text}>
        <Markdown allowColors={false}>{message.text}</Markdown>
      </div>
      {trail && <div className={styles.trail}>{trail}</div>}
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  );
};

export { MessageCard };
