import styles from "src/components/common/Button/index.module.css";

interface SubmitButtonProps {
  className?: string | undefined;
  disabled?: boolean | undefined;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
  children?: React.ReactNode | string | undefined;
  tooltip?: string | undefined;
}

const SubmitButton = ({
  className,
  onClick,
  icon,
  children,
  disabled,
  tooltip,
}: SubmitButtonProps) => {
  const handleLinkClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onClick) {
      onClick();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const classNames = [styles.button];
  if (disabled) {
    classNames.push(styles.disabled);
  }
  if (className) {
    classNames.push(className);
  }

  return (
    <button
      type="submit"
      title={tooltip}
      className={classNames.join(" ")}
      onClick={handleLinkClick}
      onAuxClick={handleLinkClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
    </button>
  );
};

export { SubmitButton };
