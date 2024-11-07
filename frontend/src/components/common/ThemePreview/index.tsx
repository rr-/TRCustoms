import styles from "./index.module.css";
import type { Theme } from "src/contexts/SettingsContext";

interface PaletteBoxProps {
  color: string;
}

const PaletteBox = ({ color }: PaletteBoxProps) => {
  return (
    <div
      title={color}
      className={styles.paletteBox}
      style={{ backgroundColor: `var(--${color})` }}
    />
  );
};

interface ThemePreviewProps {
  theme: Theme;
}

const ThemePreview = ({ theme }: ThemePreviewProps) => {
  return (
    <div data-theme={theme.stub}>
      <div className={styles.root}>
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

      <div className={styles.paletteBar}>
        <PaletteBox color="v2-bg-color-1" />
        <PaletteBox color="v2-bg-color-2" />
        <PaletteBox color="v2-bg-color-3" />
        <PaletteBox color="v2-bg-color-4" />
        <PaletteBox color="v2-bg-color-5" />
      </div>
      <div className={styles.paletteBar}>
        <PaletteBox color="v2-fg-color-1" />
        <PaletteBox color="v2-fg-color-2" />
      </div>
      <div className={styles.paletteBar}>
        <PaletteBox color="v2-accent-color-1" />
        <PaletteBox color="v2-accent-color-2" />
        <PaletteBox color="v2-accent-color-3" />
      </div>
    </div>
  );
};

export { ThemePreview };
