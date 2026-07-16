import { useQueryClient } from "@tanstack/react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { resetQueries } from "src/utils/misc";

interface TagMergeButtonProps {
  tag: TagListing;
}

const TagMergeButton = ({ tag }: TagMergeButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (newTagName: string) => {
    const targetTag = await TagService.getByName(newTagName);
    await TagService.merge(tag.id, targetTag.id);
    resetQueries(queryClient, ["tags", "auditLogs"]);
  };

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
