import styles from "./EngineGFXLink.module.css";
import { EngineLink } from "src/components/links/EngineLink";
import type { EngineLinkProps } from "src/components/links/EngineLink";
import type { EngineListing } from "src/services/EngineService";

interface EngineGFXLinkProps extends EngineLinkProps {
  engine: EngineListing;
}

const EngineGFXLink = ({ engine, ...props }: EngineGFXLinkProps) => {
  return (
    <EngineLink
      engine={engine}
      className={styles.link}
      style={{
        backgroundImage: `url('/side-${engine.name.toLowerCase()}.jpg')`,
      }}
      {...props}
    >
      <aside className={styles.aside}>
        {engine.name}
        <br />
        {engine.level_count}
      </aside>
    </EngineLink>
  );
};

export { EngineGFXLink };
