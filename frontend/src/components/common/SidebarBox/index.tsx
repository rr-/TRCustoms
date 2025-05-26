import styles from "./index.module.css";
import { SectionHeader } from "src/components/common/Section";

interface SidebarBoxProps {
  header?: React.ReactNode | undefined;
  children: React.ReactNode;
}

interface SidebarBoxHeaderProps {
  children: React.ReactNode;
  alignToTabSwitch: boolean;
}

const SidebarBox = ({ header, children }: SidebarBoxProps) => {
  return (
    <div className={styles.wrapper}>
      {header && <div className={styles.box}>{header}</div>}
      <div className={`${styles.box} ChildMarginClear`}>{children}</div>
    </div>
  );
};

const SidebarBoxHeader = ({
  children,
  alignToTabSwitch,
}: SidebarBoxHeaderProps) => {
  return (
    <h2
      className={[
        styles.header,
        ...(alignToTabSwitch ? [styles.alignToTabSwitch] : []),
      ].join(" ")}
    >
      {children}
    </h2>
  );
};

export { SidebarBox };
export { SidebarBoxHeader };
