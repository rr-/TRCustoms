import { useState } from "react";
import type { UserLite } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { AutoComplete } from "src/shared/components/AutoComplete";
import type { GenericFormFieldProps } from "src/shared/components/BaseFormField";
import { BaseFormField } from "src/shared/components/BaseFormField";
import { Pills } from "src/shared/components/Pills";

interface UsersFormFieldProps extends GenericFormFieldProps {
  value: UserLite[];
  onChange: (value: UserLite[]) => void;
}

const UsersFormField = ({
  name,
  readonly,
  value,
  onChange,
  ...props
}: UsersFormFieldProps) => {
  const [suggestions, setSuggestions] = useState<UserLite[]>([]);

  const selectedUsers = [...value];

  const onSearchTrigger = async (userInput: string) => {
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
            selectedUsers.every((u) => u.id !== user.id)
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onResultApply = (user: UserLite) =>
    onChange(
      value.map((u) => u.id).includes(user.id) ? value : [...value, user]
    );

  const removeUser = (user: UserLite) =>
    onChange(value.filter((u) => u.id !== user.id));

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
        source={selectedUsers}
        getKey={(user) => user.username}
        getText={(user) => user.username}
        onRemove={removeUser}
      />
    </BaseFormField>
  );
};

export { UsersFormField };
