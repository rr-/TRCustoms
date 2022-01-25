import "./GenresFormField.css";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { Field } from "formik";
import { useContext } from "react";
import { GenreNested } from "src/services/genre.service";
import { GenreListing } from "src/services/genre.service";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

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
  const genreMap: { [genreId: string]: GenreListing } = Object.fromEntries(
    config.genres.map(({ id, ...rest }) => [id, { id, ...rest }])
  );

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <div className="GenresFormField">
        {Object.values(genreMap).map((genre) => (
          <div key={genre.id}>
            <label className="GenresFormField--label">
              <Field
                disabled={readonly}
                type="checkbox"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onChange(
                    event.target.checked
                      ? [...value, genre]
                      : [...value.filter((g) => g.id !== genre.id)]
                  )
                }
                checked={value.map((g) => g.id).includes(genre.id)}
              />
              <span className="GenresFormField--labelText">{genre.name}</span>{" "}
              <span title={genre.description}>
                <InformationCircleIcon className="icon" />
              </span>
            </label>
          </div>
        ))}
      </div>
    </BaseFormField>
  );
};

export { GenresFormField };
