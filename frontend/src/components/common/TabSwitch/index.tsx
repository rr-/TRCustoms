import styles from "./index.module.css";

interface TabPage {
  name: string;
  label: string;
  content: React.ReactElement;
}

interface TabSwitchProps {
  tabs: TabPage[];
  activeTabName?: string;
  onTabClick?: (tab: TabPage) => void;
}

const TabSwitch = ({ tabs, activeTabName, onTabClick }: TabSwitchProps) => {
  const handleTabClick = (tab: TabPage) => {
    onTabClick?.(tab);
  };

  activeTabName ??= tabs[0]?.name;

  return (
    <div className={styles.wrapper}>
      <div className={styles.navWrapper}>
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
      </div>

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
  );
};

interface ConcreteTabSwitchProps {
  tabs: TabPage[];
  tabName: string;
  onTabChange: (tab: TabPage) => void;
}

const ConcreteTabSwitch = ({
  tabs,
  tabName,
  onTabChange,
  style,
}: ConcreteTabSwitchProps & { style: string }) => {
  const handleTabClick = (tab: TabPage) => {
    onTabChange?.(tab);
  };

  return (
    <div className={style}>
      <TabSwitch
        tabs={tabs}
        activeTabName={tabName}
        onTabClick={handleTabClick}
      />
    </div>
  );
};

const LightTabSwitch = (props: ConcreteTabSwitchProps) => {
  return <ConcreteTabSwitch style={styles.light} {...props} />;
};

const BoxedTabSwitch = (props: ConcreteTabSwitchProps) => {
  return <ConcreteTabSwitch style={styles.boxed} {...props} />;
};

export type { TabPage };
export { LightTabSwitch, BoxedTabSwitch, TabSwitch };
