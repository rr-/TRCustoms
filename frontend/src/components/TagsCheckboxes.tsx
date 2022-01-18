import { useContext } from "react";
import { CheckboxArrayFormField } from "src/shared/components/formfields/CheckboxArrayFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

const TagsCheckboxes = () => {
  const { config } = useContext(ConfigContext);
  const source: { value: number; label: string }[] = config.tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));
  return <CheckboxArrayFormField label="Tags" name="tags" source={source} />;
};

export { TagsCheckboxes };
