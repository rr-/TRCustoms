import styles from "./index.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface MyLinkProps {
  className?: string | undefined;
  to?: string | null | undefined;
  enableTimeout?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
  children?: React.ReactNode | string | undefined;
  tooltip?: string | undefined;
  forceNewWindow?: boolean | undefined;
}

const MyLink = ({
  className,
  to,
  enableTimeout,
  onClick,
  icon,
  children,
  disabled,
  tooltip,
  forceNewWindow,
}: MyLinkProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleLinkClick = (event: React.MouseEvent) => {
    if (isTimeoutActive || disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (enableTimeout) {
      setIsTimeoutActive(true);
      setTimer(window.setTimeout(() => setIsTimeoutActive(false), 5000));
    }
    if (onClick) {
      onClick();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const classNames = [styles.link];
  if (disabled || isTimeoutActive) {
    classNames.push(styles.disabled);
  }
  if (icon) {
    classNames.push(styles.withIcon);
  }
  if (className) {
    classNames.push(className);
  }

  const inside = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </>
  );

  if (to?.includes("://") || (to && forceNewWindow)) {
    // handle external links
    return (
      <a
        title={tooltip}
        rel="noopener noreferrer"
        target="_blank"
        className={classNames.join(" ")}
        onClick={handleLinkClick}
        onAuxClick={handleLinkClick}
        href={to}
      >
        {inside}
      </a>
    );
  }

  return (
    <Link
      title={tooltip}
      className={classNames.join(" ")}
      onClick={handleLinkClick}
      onAuxClick={handleLinkClick}
      to={to || "#"}
    >
      {inside}
    </Link>
  );
};

export type { MyLinkProps as LinkProps };
export { MyLink as Link };
