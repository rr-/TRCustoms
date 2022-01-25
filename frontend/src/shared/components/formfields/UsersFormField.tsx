import { useState } from "react";
import { useCallback } from "react";
import type { UserNested } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { AutoComplete } from "src/shared/components/AutoComplete";
import { Pills } from "src/shared/components/Pills";
import type { GenericFormFieldProps } from "src/shared/components/formfields/BaseFormField";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";

interface UsersFormFieldProps extends GenericFormFieldProps {
  value: UserNested[];
  onChange: (value: UserNested[]) => void;
}

const UsersFormField = ({
  name,
  readonly,
  value,
  onChange,
  ...props
}: UsersFormFieldProps) => {
  const [suggestions, setSuggestions] = useState<UserNested[]>([]);

  const onSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      const searchQuery = {
        search: userInput,
      };
      try {
        const response = await UserService.searchUsers(searchQuery);
        if (response.results) {
          setSuggestions(
            response.results.filter((user) =>
              value.every((u) => u.id !== user.id)
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [value]
  );

  const onResultApply = useCallback(
    (user: UserNested) =>
      onChange(
        value.map((u) => u.id).includes(user.id) ? value : [...value, user]
      ),
    [onChange, value]
  );

  const removeUser = useCallback(
    (user: UserNested) => onChange(value.filter((u) => u.id !== user.id)),
    [onChange, value]
  );

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <AutoComplete
        suggestions={suggestions}
        getResultText={(user) => user.username}
        getResultKey={(user) => user.username}
        onSearchTrigger={onSearchTrigger}
        onResultApply={onResultApply}
      />
      <Pills
        source={value}
        getKey={(user) => user.username}
        getText={(user) => user.username}
        onRemove={removeUser}
      />
    </BaseFormField>
  );
};

export { UsersFormField };
