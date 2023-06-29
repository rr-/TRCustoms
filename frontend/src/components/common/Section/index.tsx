import styles from "./index.module.css";

interface SectionProps {
  children: React.ReactNode;
}

interface SectionHeaderProps {
  children: React.ReactNode;
}

const Section = ({ children }: SectionProps) => {
  return (
    <section className={`${styles.section} ChildMarginClear`}>
      {children}
    </section>
  );
};

const SectionHeader = ({ children }: SectionHeaderProps) => {
  return <h2 className={styles.header}>{children}</h2>;
};

export { Section, SectionHeader };
