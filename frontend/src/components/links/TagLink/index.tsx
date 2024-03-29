import { Link } from "src/components/common/Link";
import type { TagNested } from "src/services/TagService";

interface TagLinkProps {
  tag: TagNested;
  children?: React.ReactNode | undefined;
}

const TagLink = ({ tag, children }: TagLinkProps) => {
  const { id, name } = tag;
  return <Link to={`/levels?tags=${id}`}>{children || name}</Link>;
};

export { TagLink };
