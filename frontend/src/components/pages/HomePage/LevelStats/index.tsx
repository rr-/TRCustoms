import { useContext } from "react";
import { Link } from "react-router-dom";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { EngineLink } from "src/components/links/EngineLink";
import { GFXCard } from "src/components/pages/HomePage/GFXCard";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <>
      {config.engines.map((engine) => (
        <EngineLink engine={engine}>
          <GFXCard name={engine.name.toLowerCase()}>
            {engine.name}
            <br />
            {engine.level_count}
          </GFXCard>
        </EngineLink>
      ))}

      <DefinitionList>
        <DefinitionItem term={<Link to="/levels">Total levels</Link>}>
          {config.total_levels}
        </DefinitionItem>

        <DefinitionItem term="Downloads">
          {reprBigNumber(config.total_downloads)} (
          {reprBigNumber(config.total_downloads / config.total_levels)} per
          level)
        </DefinitionItem>
      </DefinitionList>
    </>
  );
};

export { LevelStats };
