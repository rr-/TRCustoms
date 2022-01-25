import { Link } from "react-router-dom";
import type { EngineNested } from "src/services/engine.service";

interface EngineLinkProps {
  engine: EngineNested;
  label?: string | null;
}

const EngineLink = ({ engine, label }: EngineLinkProps) => {
  const { id, name } = engine;
  label ||= name;
  return <Link to={`/?engines=${id}`}>{label}</Link>;
};

export { EngineLink };
