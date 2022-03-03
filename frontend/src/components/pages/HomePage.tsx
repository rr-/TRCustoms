import "./HomePage.css";
import { sortBy } from "lodash";
import { round } from "lodash";
import { useContext } from "react";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { FeaturedLevelsView } from "src/components/FeaturedLevelsView";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { EngineLink } from "src/components/links/EngineLink";
import { ConfigContext } from "src/contexts/ConfigContext";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <DefinitionList>
      <DefinitionItem term="Total levels">{config.total_levels}</DefinitionItem>

      <DefinitionItemGroup>
        {sortBy(config.engines, (engine) => engine.name).map((engine) => (
          <DefinitionItem term={<EngineLink engine={engine} />}>
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

  const maxLevelCount = Math.max(
    ...config.review_stats.map((item) => item.level_count)
  );
  const minRatingClassPosition = Math.min(
    ...config.review_stats.map((item) => item.rating_class.position)
  );
  const maxRatingClassPosition = Math.max(
    ...config.review_stats.map((item) => item.rating_class.position)
  );

  return (
    <div className="ReviewStats">
      <header className="ReviewStats--header"></header>
      <ul className="ReviewStats--list">
        {sortBy(config.review_stats, (item) => item.rating_class.position).map(
          (item) => (
            <li key={item.rating_class.name} className="ReviewStats--listItem">
              <div className="ReviewStats--tooltip">
                {item.rating_class.name}: {item.level_count}
              </div>
              <div
                data-rating-position={item.rating_class.position}
                title={item.rating_class.name}
                className="ReviewStats--indicator"
                style={{
                  height: `${(item.level_count * 100) / maxLevelCount}%`,
                }}
              >
                <div
                  className="ReviewStats--indicatorFill"
                  style={{
                    opacity: `${
                      ((item.rating_class.position - minRatingClassPosition) /
                        (maxRatingClassPosition - minRatingClassPosition)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </li>
          )
        )}
      </ul>
      <footer className="ReviewStats--footer">All level ratings</footer>
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
        <SidebarBox>
          <SectionHeader>Statistics</SectionHeader>
          <LevelStats />
          <ReviewStats />
        </SidebarBox>
      </aside>
      <div className="HomePage--main">
        <Section>
          <SectionHeader>News</SectionHeader>
          Lorem Ipsum
        </Section>
      </div>
    </div>
  );
};

export { HomePage };
