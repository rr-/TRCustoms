import { Link } from "react-router-dom";
import type { GenreLite } from "src/services/genre.service";

interface GenreLinkProps {
  genre: GenreLite;
}

const GenreLink = ({ genre }: GenreLinkProps) => {
  const { id, name } = genre;
  return <Link to={`/?genres=${id}`}>{name}</Link>;
};

export { GenreLink };
