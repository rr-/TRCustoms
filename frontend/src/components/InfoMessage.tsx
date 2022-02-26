import "./InfoMessage.css";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { ExclamationIcon } from "@heroicons/react/outline";

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
      return <InformationCircleIcon className="icon" />;
    case InfoMessageType.Warning:
      return <ExclamationIcon className="icon" />;
  }
};

const InfoMessage = ({ type, children }: InfoMessageProps) => {
  return (
    <div className="InfoMessage">
      <aside className="InfoMessage--aside">
        <InfoMessageIcon type={type} />
      </aside>
      <div className="InfoMessage--text">{children}</div>
    </div>
  );
};

export { InfoMessageType, InfoMessage };
