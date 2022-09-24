import "./index.css";
import { useFormikContext } from "formik";
import { useContext } from "react";
import { Checkbox } from "src/components/Checkbox";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { IconInformationCircle } from "src/components/icons";
import { ConfigContext } from "src/contexts/ConfigContext";
import { GenreNested } from "src/services/GenreService";
import { GenreListing } from "src/services/GenreService";

interface GenresFormFieldProps extends GenericFormFieldProps {
  value: GenreNested[];
  onChange: (value: GenreNested[]) => void;
}

const GenresFormField = ({
  name,
  readonly,
  value,
  onChange,
  ...props
}: GenresFormFieldProps) => {
  const { config } = useContext(ConfigContext);
  const { setFieldTouched } = useFormikContext();
  const genreMap: { [genreId: string]: GenreListing } = Object.fromEntries(
    config.genres.map(({ id, ...rest }) => [id, { id, ...rest }])
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    genre: GenreListing
  ) => {
    setFieldTouched(name);
    onChange(
      event.target.checked
        ? [...value, genre]
        : [...value.filter((g) => g.id !== genre.id)]
    );
  };

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="GenresFormField">
        {Object.values(genreMap).map((genre) => (
          <div key={genre.id}>
            <label className="GenresFormField--label">
              <Checkbox
                label={genre.name}
                disabled={readonly}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(event, genre)
                }
                checked={value.map((g) => g.id).includes(genre.id)}
              />
              <span title={genre.description}>
                <IconInformationCircle />
              </span>
            </label>
          </div>
        ))}
      </div>
    </BaseFormField>
  );
};

export { GenresFormField };
