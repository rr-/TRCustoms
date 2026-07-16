import { useQueryClient } from "@tanstack/react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { resetQueries } from "src/utils/misc";

interface TagDeleteButtonProps {
  tag: TagListing;
}

const TagDeleteButton = ({ tag }: TagDeleteButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await TagService.delete(tag.id);
    resetQueries(queryClient, ["tags", "auditLogs"]);
  };

  return (
    <ConfirmButton
      text={`Are you sure you want to delete tag ${tag.name}?`}
      buttonLabel="Delete"
      disableTimeout={true}
      onConfirm={handleConfirm}
    />
  );
};

export { TagDeleteButton };
