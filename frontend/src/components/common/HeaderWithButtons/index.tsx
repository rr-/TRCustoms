import styles from "./index.module.css";

interface HeaderWithButtonsProps {
  header: React.ReactNode;
  buttons: React.ReactNode;
}

const HeaderWithButtons = ({ header, buttons }: HeaderWithButtonsProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>{header}</div>

      <div className={styles.buttons}>{buttons}</div>
    </div>
  );
};

export { HeaderWithButtons };
