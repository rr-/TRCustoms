import { useContext } from "react";
import { Link } from "react-router-dom";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { EngineGFXLink } from "src/components/links/EngineGFXLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { reprBigNumber } from "src/utils/string";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <>
      {config.engines.map((engine) => (
        <EngineGFXLink key={engine.id} engine={engine} />
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
