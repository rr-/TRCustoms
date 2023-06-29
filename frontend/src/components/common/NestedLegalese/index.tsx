import type { LegaleseEntry } from "./LegaleseItem";
import { LegaleseItem } from "./LegaleseItem";
import { LegaleseTOCItem } from "./LegaleseTOCItem";
import styles from "./index.module.css";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";

interface NestedLegaleseProps {
  prefix: string;
  title?: string | undefined;
  entry: LegaleseEntry;
}

const NestedLegalese = ({ prefix, title, entry }: NestedLegaleseProps) => {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.toc}>
        <SidebarBox>
          <SectionHeader>Table of Contents</SectionHeader>
          <LegaleseTOCItem prefix={prefix} currentNumber={[]} entry={entry} />
        </SidebarBox>
      </aside>

      <div>
        {title && <h1>{title}</h1>}
        <LegaleseItem prefix={prefix} currentNumber={[]} entry={entry} />
      </div>
    </div>
  );
};

export { NestedLegalese };
export type { LegaleseEntry };
