import styles from "./index.module.css";
import { useState } from "react";

enum TabSwitchVariant {
  Light = "light",
  Boxed = "boxed",
}

interface TabPage {
  name: string;
  label: string;
  content: React.ReactElement;
}

interface TabSwitchProps {
  variant: TabSwitchVariant;
  tabs: TabPage[];
  tabName?: string;
  onTabChange?: (tab: TabPage) => void;
}

const TabSwitch = ({ variant, tabs, tabName, onTabChange }: TabSwitchProps) => {
  const [activeTabName, setActiveTabName] = useState(tabName ?? tabs[0]?.name);

  const handleTabClick = (tab: TabPage) => {
    setActiveTabName(tab.name);
    onTabChange?.(tab);
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
            {tabs.map((tab) => (
              <li
                className={`${styles.navItem} ${
                  tab.name === activeTabName ? styles.active : ""
                }`}
                key={tab.name}
              >
                <span
                  role="button"
                  className={styles.navItemLink}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.content}>
          {tabs.map((tab) => (
            <div
              className={`${styles.contentItem} ${
                tab.name === activeTabName ? styles.active : ""
              } ChildMarginClear`}
              key={tab.name}
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
