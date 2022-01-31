import { sortBy } from "lodash";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import type { GenreNested } from "src/services/genre.service";
import type { LevelSearchQuery } from "src/services/level.service";
import { Checkbox } from "src/shared/components/Checkbox";
import { PushButton } from "src/shared/components/PushButton";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const MAX_VISIBLE_GENRES = 8;

interface GenresCheckboxesProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => any;
}

const GenresCheckboxes = ({
  searchQuery,
  onSearchQueryChange,
}: GenresCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleGenres, setVisibleGenres] = useState<GenreNested[]>([]);

  useEffect(() => {
    setVisibleGenres(
      sortBy(config.genres, (genre) => genre.name).filter(
        (genre, i) =>
          isExpanded ||
          i < MAX_VISIBLE_GENRES ||
          searchQuery.genres.includes(genre.id)
      )
    );
  }, [isExpanded, setVisibleGenres, config]);

  const handleExpandButtonClick = () => {
    setIsExpanded((value) => !value);
  };

  const handleChange = (
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
        <div key={genre.id}>
          <Checkbox
            label={genre.name}
            checked={searchQuery.genres.includes(genre.id)}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(event, genre)
            }
          />
        </div>
      ))}
      <div>
        <PushButton
          isPlain={true}
          disableTimeout={true}
          onClick={handleExpandButtonClick}
        >
          {isExpanded ? "Show less" : "Show all"}
        </PushButton>
      </div>
    </div>
  );
};

export { GenresCheckboxes };
