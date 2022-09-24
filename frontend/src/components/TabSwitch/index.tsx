import "./index.css";
import { useState } from "react";

interface TabPage {
  label: string;
  content: React.ReactElement;
}

interface TabSwitchProps {
  tabs: TabPage[];
}

const TabSwitch = ({ tabs }: TabSwitchProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  return (
    <div className="TabSwitch">
      <nav>
        <ul className="TabSwitch--nav">
          {tabs.map((tab, i) => (
            <li
              className={`TabSwitch--navItem ${
                i === activeTab ? "active" : ""
              }`}
              key={i}
            >
              <span
                role="button"
                className="TabSwitch--navItemLink"
                onClick={() => handleTabClick(i)}
              >
                {tab.label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="TabSwitch--content">
        {tabs.map((tab, i) => (
          <div
            className={`TabSwitch--contentItem ${
              i === activeTab ? "active" : ""
            }`}
            key={i}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export type { TabPage };
export { TabSwitch };
