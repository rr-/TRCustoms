import type { EngineNested } from "src/client";
import { Link } from "src/components/common/Link";

interface EngineLinkProps {
  engine: EngineNested;
  children?: React.ReactNode | undefined;
}

const EngineLink = ({ engine, children, ...props }: EngineLinkProps) => {
  const { id, name } = engine;
  return <Link to={`/levels?engines=${id}`}>{children || name}</Link>;
};

export { EngineLink };
export type { EngineLinkProps };
