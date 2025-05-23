import { useFormikContext } from "formik";
import { sortBy } from "lodash";
import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Pills } from "src/components/common/Pills";
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
  const { setFieldTouched } = useFormikContext();
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
      setFieldTouched(name);
      onChange(
        value.map((t) => t.id).includes(tag.id) ? value : [...value, tag],
      );
    },
    [setFieldTouched, onChange, name, value],
  );

  const handleNewResultApply = useCallback(
    async (text: string) => {
      text = text.trim();
      text = text[0].toUpperCase() + text.substr(1);
      if (value.map((t) => t.name.toLowerCase()).includes(text.toLowerCase())) {
        return;
      }
      setFieldTouched(name);
      const tag = await TagService.create({ name: text });
      onChange([...value, tag]);
      await refetchConfig();
    },
    [setFieldTouched, onChange, refetchConfig, name, value],
  );

  const removeTag = useCallback(
    (tag: TagNested) => {
      setFieldTouched(name);
      onChange(value.filter((t) => t.id !== tag.id));
    },
    [setFieldTouched, onChange, name, value],
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
