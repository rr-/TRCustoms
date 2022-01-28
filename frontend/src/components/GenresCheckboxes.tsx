import { sortBy } from "lodash";
import { useContext } from "react";
import type { GenreNested } from "src/services/genre.service";
import type { LevelSearchQuery } from "src/services/level.service";
import { Checkbox } from "src/shared/components/Checkbox";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

interface GenresCheckboxesProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => any;
}

const GenresCheckboxes = ({
  searchQuery,
  onSearchQueryChange,
}: GenresCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const visibleGenres = sortBy(config.genres, (genre) => genre.name);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    genre: GenreNested
  ) => {
    onSearchQueryChange({
      ...searchQuery,
      genres: event.target.checked
        ? [...searchQuery.genres, genre.id]
        : searchQuery.genres.filter((genreId) => genreId !== genre.id),
    });
  };

  return (
    <div className="GenresCheckboxes">
      <p>Genres:</p>
      {visibleGenres.map((genre) => (
        <div>
          <Checkbox
            label={genre.name}
            checked={searchQuery.genres.includes(genre.id)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event, genre)
            }
          />
        </div>
      ))}
    </div>
  );
};

export { GenresCheckboxes };
