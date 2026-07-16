import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { queryKeys } from "src/services/queryKeys";

interface TagRenameButtonProps {
  tag: TagListing;
}

const TagRenameButton = ({ tag }: TagRenameButtonProps) => {
  const handleConfirm = useEntityAction(
    async (newTagName: string) => {
      await TagService.update(tag.id, { name: newTagName });
    },
    [queryKeys.tags.all, queryKeys.auditLogs.all],
  );

  return (
    <PromptButton
      text={`Enter new name for ${tag.name}.`}
      promptLabel="Tag name"
      buttonLabel="Rename"
      onConfirm={handleConfirm}
    />
  );
};

export { TagRenameButton };
