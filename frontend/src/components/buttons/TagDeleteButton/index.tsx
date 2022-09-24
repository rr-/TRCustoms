import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface TagDeleteButtonProps {
  tag: TagListing;
}

const TagDeleteButton = ({ tag }: TagDeleteButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await TagService.delete(tag.id);
      resetQueries(queryClient, ["tags", "auditLogs"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to delete tag {tag.name}?
      </ConfirmModal>

      <Button disableTimeout={true} onClick={handleButtonClick}>
        Delete
      </Button>
    </>
  );
};

export { TagDeleteButton };
