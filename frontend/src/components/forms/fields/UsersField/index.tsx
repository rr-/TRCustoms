import { useState } from "react";
import { useCallback } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Pills } from "src/components/common/Pills";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";
import type { UserNested } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface UsersFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
}

// react-hook-form port of UsersFormField: an autocomplete over users plus
// removable pills, bound to an array of the selected users.
const UsersField = ({ name, readonly, ...baseProps }: UsersFieldProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const value: UserNested[] = field.value || [];
  const [suggestions, setSuggestions] = useState<UserNested[]>([]);

  const handleSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await UserService.searchUsers({ search: userInput });
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
      field.onChange(
        value.map((u) => u.id).includes(user.id) ? value : [...value, user],
      ),
    [field, value],
  );

  const handleRemoveUser = useCallback(
    (user: UserNested) => field.onChange(value.filter((u) => u.id !== user.id)),
    [field, value],
  );

  return (
    <BaseField name={name} {...baseProps}>
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
    </BaseField>
  );
};

export { UsersField };
