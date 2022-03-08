import "./HomePage.css";
import { sortBy } from "lodash";
import { round } from "lodash";
import { useState } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { FeaturedLevelsView } from "src/components/FeaturedLevelsView";
import { NewsList } from "src/components/NewsList";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { IconKofi } from "src/components/icons/IconKofi";
import { EngineLink } from "src/components/links/EngineLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { UserPermission } from "src/services/UserService";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <DefinitionList>
      <DefinitionItem term={<Link to="/levels">Total levels</Link>}>
        {config.total_levels}
      </DefinitionItem>

      <DefinitionItemGroup className="LevelStats--engines">
        {sortBy(config.engines, (engine) => engine.position).map((engine) => (
          <DefinitionItem key={engine.id} term={<EngineLink engine={engine} />}>
            {engine.level_count}
          </DefinitionItem>
        ))}
      </DefinitionItemGroup>

      <DefinitionItem term="Reviews">
        {config.total_reviews} (
        {round(config.total_reviews / config.total_levels, 2)}/level)
      </DefinitionItem>
    </DefinitionList>
  );
};

const ReviewStats = () => {
  const { config } = useContext(ConfigContext);
  const [tooltip, setTooltip] = useState<string | undefined>();

  const maxLevelCount = Math.max(
    ...config.review_stats.map((item) => item.level_count)
  );
  const maxRatingClassPosition = Math.max(
    ...config.review_stats.map((item) => item.rating_class.position)
  );

  const handleMouseEnter = (item: typeof config.review_stats[0]) => {
    setTooltip(`${item.rating_class.name}: ${item.level_count}`);
  };

  const handleMouseLeave = (item: typeof config.review_stats[0]) => {
    setTooltip(undefined);
  };

  return (
    <div className="ReviewStats">
      <header className="ReviewStats--header"></header>
      <ul className="ReviewStats--list">
        {sortBy(config.review_stats, (item) => item.rating_class.position).map(
          (item) => (
            <li
              key={item.rating_class.name}
              className="ReviewStats--listItem"
              onMouseEnter={() => handleMouseEnter(item)}
              onMouseLeave={() => handleMouseLeave(item)}
            >
              <div
                data-rating-position={item.rating_class.position}
                title={item.rating_class.name}
                className="ReviewStats--indicator"
                style={{
                  height: `${(item.level_count * 100) / maxLevelCount}%`,
                }}
              >
                <div
                  className={`ReviewStats--indicatorFill ${
                    item.rating_class.position > 0 ? "positive" : "negative"
                  }`}
                  style={{
                    opacity: `${
                      Math.abs(
                        item.rating_class.position / maxRatingClassPosition
                      ) * 100
                    }%`,
                  }}
                />
              </div>
            </li>
          )
        )}
      </ul>
      <footer className="ReviewStats--footer">
        {tooltip || "All level ratings"}
      </footer>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="HomePage">
      <div className="HomePage--featuredLevels">
        <FeaturedLevelsView />
      </div>
      <aside className="HomePage--sidebar">
        <SidebarBox
          actions={
            <PermissionGuard require={UserPermission.editNews}>
              <PushButton to={`/news`}>Add news</PushButton>
            </PermissionGuard>
          }
        >
          <SectionHeader>Statistics</SectionHeader>
          <LevelStats />
          <ReviewStats />

          <Section className="HomePage--sidebarExtra">
            <SectionHeader>Extra</SectionHeader>
            <PushButton icon={<IconKofi />} to="https://ko-fi.com/trcustomsorg">
              Support us on Ko-fi
            </PushButton>
          </Section>
        </SidebarBox>
      </aside>
      <div className="HomePage--main">
        <Section>
          <SectionHeader>News</SectionHeader>
          <NewsList />
        </Section>
      </div>
    </div>
  );
};

export { HomePage };
