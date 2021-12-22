import { Link } from "react-router-dom";
import type { Genre } from "src/services/level.service";

interface GenreLinkProps {
  genre: Genre;
}

const GenreLink = ({ genre }: GenreLinkProps) => {
  const { id, name } = genre;
  return <Link to={`/?genres=${id}`}>{name}</Link>;
};

export default GenreLink;
