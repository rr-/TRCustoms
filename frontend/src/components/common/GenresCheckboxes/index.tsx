import { sortBy } from "lodash";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Checkbox } from "src/components/common/Checkbox";
import { FilterCheckboxesHeader } from "src/components/common/FilterCheckboxesHeader";
import { PushButton } from "src/components/common/PushButton";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { GenreNested } from "src/services/GenreService";

const MAX_VISIBLE_GENRES = 8;

interface GenresCheckboxesProps {
  value: number[];
  onChange: (value: number[]) => any;
}

const GenresCheckboxes = ({ value, onChange }: GenresCheckboxesProps) => {
  const { config } = useContext(ConfigContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleGenres, setVisibleGenres] = useState<GenreNested[]>([]);

  useEffect(() => {
    setVisibleGenres(
      sortBy(config.genres, (genre) => genre.name).filter(
        (genre, i) =>
          isExpanded || i < MAX_VISIBLE_GENRES || value.includes(genre.id)
      )
    );
  }, [isExpanded, setVisibleGenres, config, value]);

  const handleExpandButtonClick = () => {
    setIsExpanded((value) => !value);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    genre: GenreNested
  ) => {
    onChange(
      event.target.checked
        ? [...value, genre.id]
        : value.filter((genreId) => genreId !== genre.id)
    );
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="GenresCheckboxes">
      <FilterCheckboxesHeader onClear={handleClear}>
        Genres:
      </FilterCheckboxesHeader>
      {visibleGenres.map((genre) => (
        <Checkbox
          key={genre.id}
          label={genre.name}
          checked={value.includes(genre.id)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(event, genre)
          }
        />
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
