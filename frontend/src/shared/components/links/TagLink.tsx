import { Link } from "react-router-dom";
import type { TagNested } from "src/services/tag.service";

interface TagLinkProps {
  tag: TagNested;
  children?: React.ReactNode | undefined;
}

const TagLink = ({ tag, children }: TagLinkProps) => {
  const { id, name } = tag;
  return <Link to={`/?tags=${id}`}>{children || name}</Link>;
};

export { TagLink };
