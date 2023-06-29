import styles from "./index.module.css";

interface HomeLayoutProps {
  children: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
}

const HomeLayout = ({ children, left, right }: HomeLayoutProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>{children}</div>
      <aside className={styles.left}>{left}</aside>
      <aside className={styles.right}>{right}</aside>
    </div>
  );
};

export { HomeLayout };
