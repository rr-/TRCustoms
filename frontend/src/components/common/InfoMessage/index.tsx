import styles from "./index.module.css";
import { IconInformationCircle } from "src/components/icons";
import { IconExclamation } from "src/components/icons";

enum InfoMessageType {
  Info,
  Warning,
}

interface InfoMessageProps {
  type: InfoMessageType;
  children: React.ReactNode;
}

interface InfoMessageIconProps {
  type: InfoMessageType;
}

const InfoMessageIcon = ({ type }: InfoMessageIconProps) => {
  switch (type) {
    case InfoMessageType.Info:
      return <IconInformationCircle />;
    case InfoMessageType.Warning:
      return <IconExclamation />;
  }
};

const InfoMessage = ({ type, children }: InfoMessageProps) => {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.aside}>
        <InfoMessageIcon type={type} />
      </aside>
      <div className={styles.text}>{children}</div>
    </div>
  );
};

export { InfoMessageType, InfoMessage };
