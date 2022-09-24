import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { PromptModal } from "src/components/modals/PromptModal";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface TagMergeButtonProps {
  tag: TagListing;
}

const TagMergeButton = ({ tag }: TagMergeButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = (newTagName: string) => {
    showAlertOnError(async () => {
      const targetTag = await TagService.getByName(newTagName);
      await TagService.merge(tag.id, targetTag.id);
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
        Enter name of the tag to merge {tag.name} with.
      </PromptModal>

      <Button disableTimeout={true} onClick={handleButtonClick}>
        Merge
      </Button>
    </>
  );
};

export { TagMergeButton };
