import { sortBy } from "lodash";
import { useState } from "react";
import { useCallback } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Pills } from "src/components/common/Pills";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";
import { TagNested } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { useConfig } from "src/stores/config";

interface TagsFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
}

// react-hook-form port of TagsFormField: an autocomplete over the configured
// tags (with on-the-fly creation) plus removable pills.
const TagsField = ({ name, readonly, ...baseProps }: TagsFieldProps) => {
  const { config, refetchConfig } = useConfig();
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const value: TagNested[] = field.value || [];
  const [suggestions, setSuggestions] = useState<TagNested[]>([]);

  const handleSearchTrigger = useCallback(
    (userInput: string) => {
      const allTags = sortBy(config.tags, (tag) => tag.name);
      setSuggestions(
        allTags.filter(
          (tag) =>
            value.every((t) => t.id !== tag.id) &&
            tag.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1,
        ),
      );
    },
    [value, config],
  );

  const handleResultApply = useCallback(
    (tag: TagNested) => {
      field.onChange(
        value.map((t) => t.id).includes(tag.id) ? value : [...value, tag],
      );
    },
    [field, value],
  );

  const handleNewResultApply = useCallback(
    async (text: string) => {
      text = text.trim();
      if (!text) {
        return;
      }
      text = text[0].toUpperCase() + text.substr(1);
      if (value.map((t) => t.name.toLowerCase()).includes(text.toLowerCase())) {
        return;
      }
      const tag = await TagService.create({ name: text });
      field.onChange([...value, tag]);
      await refetchConfig();
    },
    [field, refetchConfig, value],
  );

  const removeTag = useCallback(
    (tag: TagNested) => {
      field.onChange(value.filter((t) => t.id !== tag.id));
    },
    [field, value],
  );

  return (
    <BaseField name={name} asGroup {...baseProps}>
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
    </BaseField>
  );
};

export { TagsField };
