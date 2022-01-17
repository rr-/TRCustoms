import { Link } from "react-router-dom";
import type { EngineLite } from "src/services/engine.service";

interface EngineLinkProps {
  engine: EngineLite;
}

const EngineLink = ({ engine }: EngineLinkProps) => {
  const { id, name } = engine;
  return <Link to={`/?engines=${id}`}>{name}</Link>;
};

export { EngineLink };
