import { useContext } from "react";
import { Link } from "react-router-dom";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { GFXCard } from "src/components/common/GFXCard";
import { EngineLink } from "src/components/links/EngineLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <>
      {config.engines.map((engine) => (
        <EngineLink key={engine.name} engine={engine}>
          <GFXCard name={engine.name.toLowerCase()}>
            {engine.name}
            <br />
            {engine.level_count}
          </GFXCard>
        </EngineLink>
      ))}

      <DefinitionList>
        <DefinitionItem term={<Link to="/levels">Total levels</Link>}>
          {config.stats.total_levels}
        </DefinitionItem>

        <DefinitionItem term="Downloads">
          {reprBigNumber(config.stats.total_downloads)} (
          {reprBigNumber(
            config.stats.total_downloads / config.stats.total_levels
          )}{" "}
          per level)
        </DefinitionItem>
      </DefinitionList>
    </>
  );
};

export { LevelStats };
