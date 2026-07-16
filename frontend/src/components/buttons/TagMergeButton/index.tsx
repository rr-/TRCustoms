import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";

interface TagMergeButtonProps {
  tag: TagListing;
}

const TagMergeButton = ({ tag }: TagMergeButtonProps) => {
  const handleConfirm = useEntityAction(
    async (newTagName: string) => {
      const targetTag = await TagService.getByName(newTagName);
      await TagService.merge(tag.id, targetTag.id);
    },
    ["tags", "auditLogs"],
  );

  return (
    <PromptButton
      text={`Enter name of the tag to merge ${tag.name} with.`}
      promptLabel="Tag name"
      buttonLabel="Merge"
      onConfirm={handleConfirm}
    />
  );
};

export { TagMergeButton };
