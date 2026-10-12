import styles from "./index.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "src/components/common/AutoComplete";
import { Button } from "src/components/common/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { hasPermission } from "src/components/common/PermissionGuard";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import type { UserNested } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { queryKeys } from "src/services/queryKeys";
import { useUser } from "src/stores/user";
import { extractErrorMessage } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface WalkthroughReassignProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughReassign = ({ walkthrough }: WalkthroughReassignProps) => {
  const { user: loggedInUser } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<UserNested[]>([]);
  const [newAuthor, setNewAuthor] = useState<UserNested | null>(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await UserService.searchUsers({ search: userInput });
        setSuggestions(
          (response.results ?? []).filter(
            (user) => user.id !== walkthrough.author?.id,
          ),
        );
      } catch (error) {
        console.error(error);
      }
    },
    [walkthrough.author?.id],
  );

  const handleResultApply = useCallback((user: UserNested) => {
    setNewAuthor(user);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleConfirm = async () => {
    if (!newAuthor) {
      return;
    }
    try {
      await WalkthroughService.reassign(walkthrough.id, newAuthor.id);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      return;
    }
    const keepsAccess =
      walkthrough.status === WalkthroughStatus.Approved ||
      hasPermission(loggedInUser, UserPermission.editWalkthroughs);
    await resetQueries(
      queryClient,
      [
        queryKeys.walkthroughs.all,
        queryKeys.users.all,
        queryKeys.auditLogs.all,
      ],
      true,
    );
    if (!keepsAccess) {
      navigate(`/levels/${walkthrough.level.id}/walkthroughs`);
      return;
    }
    setSuccessMessage(`Walkthrough reassigned to ${newAuthor.username}.`);
    setNewAuthor(null);
  };

  return (
    <div className={styles.wrapper}>
      <ConfirmModal
        confirmLabel="Continue"
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleConfirm}
      >
        You won't be able to modify the submission after reassigning.
      </ConfirmModal>

      <p>Not your walkthrough? Reassign to a different user:</p>
      <div className={styles.controls}>
        <AutoComplete
          placeholder="Search users…"
          suggestions={suggestions}
          getResultText={(user) => user.username}
          getResultKey={(user) => user.id}
          onSearchTrigger={handleSearchTrigger}
          onResultApply={handleResultApply}
        />
        {newAuthor && (
          <span>
            Selected: <strong>{newAuthor.username}</strong>
          </span>
        )}
        <Button
          disabled={!newAuthor}
          disableTimeout={true}
          onClick={() => setIsModalActive(true)}
        >
          Assign
        </Button>
      </div>

      {errorMessage && (
        <InfoMessage type={InfoMessageType.Warning}>{errorMessage}</InfoMessage>
      )}
      {successMessage && (
        <InfoMessage type={InfoMessageType.Info}>{successMessage}</InfoMessage>
      )}
    </div>
  );
};

export { WalkthroughReassign };
