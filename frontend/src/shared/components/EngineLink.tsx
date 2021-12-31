import { Link } from "react-router-dom";
import type { Engine } from "src/services/engine.service";

interface EngineLinkProps {
  engine: Engine;
}

const EngineLink = ({ engine }: EngineLinkProps) => {
  const { id, name } = engine;
  return <Link to={`/?engines=${id}`}>{name}</Link>;
};

export default EngineLink;
