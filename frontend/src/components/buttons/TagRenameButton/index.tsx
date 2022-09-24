import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { PromptModal } from "src/components/modals/PromptModal";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface TagRenameButtonProps {
  tag: TagListing;
}

const TagRenameButton = ({ tag }: TagRenameButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = (newTagName: string) => {
    showAlertOnError(async () => {
      await TagService.update(tag.id, { name: newTagName });
      resetQueries(queryClient, ["tags", "auditLogs"]);
    });
  };

  return (
    <>
      <PromptModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
        label="Tag name"
      >
        Enter new name for {tag.name}.
      </PromptModal>

      <Button disableTimeout={true} onClick={handleButtonClick}>
        Rename
      </Button>
    </>
  );
};

export { TagRenameButton };
