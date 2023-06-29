import styles from "./index.module.css";

interface PageHeaderProps {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
}

const PageHeader = ({ header, subheader }: PageHeaderProps) => {
  return header || subheader ? (
    <header className="ChildMarginClear">
      {header && <h1 className={styles.headerText}>{header}</h1>}
      {subheader && <h2 className={styles.subheaderText}>{subheader}</h2>}
    </header>
  ) : (
    <></>
  );
};

export { PageHeader };
