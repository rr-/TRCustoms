import { Link } from "react-router-dom";

interface Genre {
  id: number | null;
  name: string;
}

interface GenreLinkProps {
  genre: Genre;
}

const GenreLink = ({ genre }: GenreLinkProps) => {
  const { id, name } = genre;
  return <Link to={`/?genres=${id}`}>{name}</Link>;
};

export { GenreLink };
