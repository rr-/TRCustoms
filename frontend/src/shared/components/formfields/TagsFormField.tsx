import { useState } from "react";
import { useContext } from "react";
import { TagLite } from "src/services/tag.service";
import { AutoComplete } from "src/shared/components/AutoComplete";
import { Pills } from "src/shared/components/Pills";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import { ConfigContext } from "src/shared/contexts/ConfigContext";

interface TagsFormFieldProps extends GenericFormFieldProps {
  value: TagLite[];
  onChange: (value: TagLite[]) => void;
}

const TagsFormField = ({
  name,
  readonly,
  value,
  onChange,
  ...props
}: TagsFormFieldProps) => {
  const config = useContext(ConfigContext);
  const [suggestions, setSuggestions] = useState<TagLite[]>([]);

  const allTags: {
    [tagId: string]: TagLite;
  } = Object.fromEntries(config.tags.map((tag) => [tag.id, tag]));
  const selectedTags = value.map((tag) => allTags[tag.id]);

  const onSearchTrigger = (userInput: string) => {
    setSuggestions(
      Object.values(allTags).filter(
        (tag) =>
          selectedTags.every((t) => t.id !== tag.id) &&
          tag.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
      )
    );
  };

  const onResultApply = (tag: TagLite) =>
    onChange(value.map((t) => t.id).includes(tag.id) ? value : [...value, tag]);

  const removeTag = (tag: TagLite) =>
    onChange(value.filter((t) => t.id !== tag.id));

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <AutoComplete
        suggestions={suggestions}
        getResultText={(tag) => tag.name}
        getResultKey={(tag) => tag.id}
        onSearchTrigger={onSearchTrigger}
        onResultApply={onResultApply}
      />
      <Pills
        source={selectedTags}
        getKey={(tag) => tag.id}
        getText={(tag) => tag.name}
        onRemove={removeTag}
      />
    </BaseFormField>
  );
};

export { TagsFormField };
