import { Link } from "react-router-dom";
import type { Tag } from "src/services/level.service";

interface TagLinkProps {
  tag: Tag;
}

const TagLink = ({ tag }: TagLinkProps) => {
  const { id, name } = tag;
  return <Link to={`/?tags=${id}`}>{name}</Link>;
};

export default TagLink;
