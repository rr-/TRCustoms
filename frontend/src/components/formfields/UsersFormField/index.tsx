import { useState } from "react";
import { useCallback } from "react";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Pills } from "src/components/common/Pills";
import type { GenericFormFieldProps } from "src/components/formfields/BaseFormField";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import type { UserNested } from "src/services/UserService";
import { UserService } from "src/services/UserService";

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

  const handleSearchTrigger = useCallback(
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
              value.every((u) => u.id !== user.id),
            ),
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [value],
  );

  const handleResultApply = useCallback(
    (user: UserNested) =>
      onChange(
        value.map((u) => u.id).includes(user.id) ? value : [...value, user],
      ),
    [onChange, value],
  );

  const handleRemoveUser = useCallback(
    (user: UserNested) => onChange(value.filter((u) => u.id !== user.id)),
    [onChange, value],
  );

  return (
    <BaseFormField name={name} readonly={readonly} {...props}>
      <AutoComplete
        suggestions={suggestions}
        getResultText={(user) => user.username}
        getResultKey={(user) => user.username}
        onSearchTrigger={handleSearchTrigger}
        onResultApply={handleResultApply}
      />
      <Pills
        source={value}
        getKey={(user) => user.username}
        getText={(user) => user.username}
        onRemove={handleRemoveUser}
      />
    </BaseFormField>
  );
};

export { UsersFormField };
