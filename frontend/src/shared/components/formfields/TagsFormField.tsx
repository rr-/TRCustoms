import { useState } from "react";
import { useContext } from "react";
import { TagService } from "src/services/tag.service";
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
  const { config, refetchConfig } = useContext(ConfigContext);
  const [suggestions, setSuggestions] = useState<TagLite[]>([]);

  const onSearchTrigger = (userInput: string) => {
    const allTags: {
      [tagId: string]: TagLite;
    } = Object.fromEntries(config.tags.map((tag) => [tag.id, tag]));

    setSuggestions(
      Object.values(allTags).filter(
        (tag) =>
          value.every((t) => t.id !== tag.id) &&
          tag.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
      )
    );
  };

  const onResultApply = (tag: TagLite) =>
    onChange(value.map((t) => t.id).includes(tag.id) ? value : [...value, tag]);

  const onNewResultApply = async (text: string) => {
    if (value.map((t) => t.name).includes(text)) {
      return;
    }
    const tag = await TagService.create({ name: text });
    onChange([...value, tag]);
    await refetchConfig();
  };

  const removeTag = (tag: TagLite) =>
    onChange(value.filter((t) => t.id !== tag.id));

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <AutoComplete
        maxLength={config.limits.max_tag_length}
        suggestions={suggestions}
        getResultText={(tag) => tag.name}
        getResultKey={(tag) => tag.id}
        onSearchTrigger={onSearchTrigger}
        onResultApply={onResultApply}
        onNewResultApply={onNewResultApply}
      />
      <Pills
        source={value}
        getKey={(tag) => tag.id}
        getText={(tag) => tag.name}
        onRemove={removeTag}
      />
    </BaseFormField>
  );
};

export { TagsFormField };
