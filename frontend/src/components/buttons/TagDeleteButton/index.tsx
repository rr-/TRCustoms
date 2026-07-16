import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";

interface TagDeleteButtonProps {
  tag: TagListing;
}

const TagDeleteButton = ({ tag }: TagDeleteButtonProps) => {
  const handleConfirm = useEntityAction(
    () => TagService.delete(tag.id),
    ["tags", "auditLogs"],
  );

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
