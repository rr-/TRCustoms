import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { AutoComplete } from "src/components/AutoComplete";
import { Pills } from "src/components/Pills";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import { ConfigContext } from "src/contexts/ConfigContext";
import { TagService } from "src/services/TagService";
import { TagNested } from "src/services/TagService";

interface TagsFormFieldProps extends GenericFormFieldProps {
  value: TagNested[];
  onChange: (value: TagNested[]) => void;
}

const TagsFormField = ({
  name,
  readonly,
  value,
  onChange,
  ...props
}: TagsFormFieldProps) => {
  const { config, refetchConfig } = useContext(ConfigContext);
  const [suggestions, setSuggestions] = useState<TagNested[]>([]);

  const handleSearchTrigger = useCallback(
    (userInput: string) => {
      const allTags: {
        [tagId: string]: TagNested;
      } = Object.fromEntries(config.tags.map((tag) => [tag.id, tag]));

      setSuggestions(
        Object.values(allTags).filter(
          (tag) =>
            value.every((t) => t.id !== tag.id) &&
            tag.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        )
      );
    },
    [config, value]
  );

  const handleResultApply = useCallback(
    (tag: TagNested) =>
      onChange(
        value.map((t) => t.id).includes(tag.id) ? value : [...value, tag]
      ),
    [onChange, value]
  );

  const handleNewResultApply = useCallback(
    async (text: string) => {
      if (value.map((t) => t.name).includes(text)) {
        return;
      }
      const tag = await TagService.create({ name: text });
      onChange([...value, tag]);
      await refetchConfig();
    },
    [onChange, refetchConfig, value]
  );

  const removeTag = useCallback(
    (tag: TagNested) => onChange(value.filter((t) => t.id !== tag.id)),
    [onChange, value]
  );

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <AutoComplete
        maxLength={config.limits.max_tag_length}
        suggestions={suggestions}
        getResultText={(tag) => tag.name}
        getResultKey={(tag) => tag.id}
        onSearchTrigger={handleSearchTrigger}
        onResultApply={handleResultApply}
        onNewResultApply={handleNewResultApply}
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
