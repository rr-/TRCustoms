import { Link } from "react-router-dom";
import type { EngineLite } from "src/services/engine.service";

interface EngineLinkProps {
  engine: EngineLite;
  label?: string | null;
}

const EngineLink = ({ engine, label }: EngineLinkProps) => {
  const { id, name } = engine;
  label ||= name;
  return <Link to={`/?engines=${id}`}>{label}</Link>;
};

export { EngineLink };
