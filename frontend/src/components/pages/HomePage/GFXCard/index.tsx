import styles from "./index.module.css";

interface GFXCardProps {
  name: string;
  children?: React.ReactNode | undefined;
}

const GFXCard = ({ name, children }: GFXCardProps) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.background}
        style={{
          backgroundImage: `url('/card-${name}.jpg')`,
        }}
      />
      <aside className={styles.aside}>{children}</aside>
    </div>
  );
};

export { GFXCard };
