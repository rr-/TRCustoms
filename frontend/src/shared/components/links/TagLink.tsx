import { Link } from "react-router-dom";
import type { TagLite } from "src/services/tag.service";

interface TagLinkProps {
  tag: TagLite;
}

const TagLink = ({ tag }: TagLinkProps) => {
  const { id, name } = tag;
  return <Link to={`/?tags=${id}`}>{name}</Link>;
};

export { TagLink };
