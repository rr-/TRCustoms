import styles from "./index.module.css";
import { useContext } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "src/components/common/Checkbox";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";
import { IconInformationCircle } from "src/components/icons";
import { ConfigContext } from "src/contexts/ConfigContext";
import { GenreListing } from "src/services/GenreService";
import { GenreNested } from "src/services/GenreService";

interface GenresFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
}

// react-hook-form port of GenresFormField: a checkbox grid of the configured
// genres, bound to an array of the selected genres.
const GenresField = ({ name, readonly, ...baseProps }: GenresFieldProps) => {
  const { config } = useContext(ConfigContext);
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const value: GenreNested[] = field.value || [];

  const genreMap: { [genreId: string]: GenreListing } = Object.fromEntries(
    config.genres.map(({ id, ...rest }) => [id, { id, ...rest }]),
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    genre: GenreListing,
  ) => {
    field.onChange(
      event.target.checked
        ? [...value, genre]
        : value.filter((g) => g.id !== genre.id),
    );
  };

  return (
    <BaseField name={name} {...baseProps}>
      <div className={styles.wrapper}>
        {Object.values(genreMap).map((genre) => (
          <div key={genre.id}>
            <label className={styles.label}>
              <Checkbox
                label={genre.name}
                disabled={readonly}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(event, genre)
                }
                checked={value.map((g) => g.id).includes(genre.id)}
              />
              <span className={styles.icon} title={genre.description}>
                <IconInformationCircle />
              </span>
            </label>
          </div>
        ))}
      </div>
    </BaseField>
  );
};

export { GenresField };
