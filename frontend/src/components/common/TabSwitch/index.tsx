import styles from "./index.module.css";
import { useState } from "react";

enum TabSwitchVariant {
  Light = "light",
  Boxed = "boxed",
}

interface TabPage {
  label: string;
  content: React.ReactElement;
}

interface TabSwitchProps {
  variant: TabSwitchVariant;
  tabs: TabPage[];
}

const TabSwitch = ({ variant, tabs }: TabSwitchProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={
          variant === TabSwitchVariant.Light ? styles.light : styles.boxed
        }
      >
        <nav>
          <ul className={styles.nav}>
            {tabs.map((tab, i) => (
              <li
                className={`${styles.navItem} ${
                  i === activeTab ? styles.active : ""
                }`}
                key={i}
              >
                <span
                  role="button"
                  className={styles.navItemLink}
                  onClick={() => handleTabClick(i)}
                >
                  {tab.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.content}>
          {tabs.map((tab, i) => (
            <div
              className={`${styles.contentItem} ${
                i === activeTab ? styles.active : ""
              } ChildMarginClear`}
              key={i}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export type { TabPage };
export { TabSwitch, TabSwitchVariant };
