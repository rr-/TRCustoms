import styles from "./index.module.css";
import type { Theme } from "src/contexts/SettingsContext";

interface ThemePreviewProps {
  theme: Theme;
}

const ThemePreview = ({ theme }: ThemePreviewProps) => {
  return (
    <div className={styles.root} data-theme={theme.stub}>
      <div className={styles.logo} />
      <div className={styles.nav} />
      <div className={styles.sidebar}>
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
      </div>
      <div className={styles.main}>
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text50}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text100}`} />
        <div className={`${styles.text} ${styles.text50}`} />
      </div>
    </div>
  );
};

export { ThemePreview };
