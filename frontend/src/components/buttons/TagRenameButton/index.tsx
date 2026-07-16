import { useQueryClient } from "@tanstack/react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import type { TagListing } from "src/services/TagService";
import { TagService } from "src/services/TagService";
import { resetQueries } from "src/utils/misc";

interface TagRenameButtonProps {
  tag: TagListing;
}

const TagRenameButton = ({ tag }: TagRenameButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (newTagName: string) => {
    await TagService.update(tag.id, { name: newTagName });
    resetQueries(queryClient, ["tags", "auditLogs"]);
  };

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
