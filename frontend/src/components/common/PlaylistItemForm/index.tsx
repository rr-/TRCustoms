import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Link } from "src/components/common/Link";
import { DropDownField } from "src/components/forms/DropDownField";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { TextField } from "src/components/forms/TextField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import type { LevelNested } from "src/services/LevelService";
import type { PlaylistItemDetails } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { z } from "zod";

interface PlaylistItemFormProps {
  userId: number;
  level: LevelNested;
  onSubmit?: (() => void) | undefined;
  onNavigateToMyPlaylist?: (() => void) | undefined;
}

interface PlaylistItemFormViewProps extends PlaylistItemFormProps {
  playlistItem?: PlaylistItemDetails | null;
}

const schema = z.object({
  levelName: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});
type PlaylistItemFormValues = z.infer<typeof schema>;

const statusOptions = [
  { label: "Not yet played", value: PlaylistItemStatus.NotYetPlayed },
  { label: "Playing", value: PlaylistItemStatus.Playing },
  { label: "Finished", value: PlaylistItemStatus.Finished },
  { label: "Dropped", value: PlaylistItemStatus.Dropped },
  { label: "On hold", value: PlaylistItemStatus.OnHold },
];

const PlaylistItemFormView = ({
  userId,
  level,
  playlistItem,
  onSubmit,
  onNavigateToMyPlaylist,
}: PlaylistItemFormViewProps) => {
  const navigate = useNavigate();
  const form = useForm<PlaylistItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      levelName: level.name,
      status: playlistItem?.status ?? "",
    },
  });

  const handleNavigateToPlaylist = useCallback(() => {
    if (onNavigateToMyPlaylist) {
      onNavigateToMyPlaylist();
    } else {
      navigate(`/users/${userId}/playlist`);
    }
  }, [userId, navigate, onNavigateToMyPlaylist]);

  const { submit, result } = useFormSubmit(form, async (values) => {
    const status = values.status as PlaylistItemStatus;
    if (playlistItem?.id) {
      await PlaylistService.update(userId, playlistItem.id, { status });
    } else {
      await PlaylistService.create(userId, { levelId: level.id, status });
    }
    onSubmit?.();
    return {
      final: true,
      success: (
        <>
          <span className="FormFieldSuccess">Playlist updated.</span>
          <br />
          <br />
          <Link onClick={handleNavigateToPlaylist}>Click here</Link> to see your
          playlist.
        </>
      ),
    };
  });

  if (result?.final && result.success) {
    return <>{result.success}</>;
  }

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet>
          <TextField label="Level" name="levelName" readonly={true} />
        </FormGridFieldSet>

        <FormGridFieldSet>
          <DropDownField
            label="Status"
            name="status"
            allowNull={false}
            options={statusOptions}
          />
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            {playlistItem ? "Update" : "Save"}
          </button>
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

const PlaylistItemForm = ({
  userId,
  level,
  onSubmit,
  onNavigateToMyPlaylist,
}: PlaylistItemFormProps) => {
  const playlistItemResult = useQuery<PlaylistItemDetails, Error>({
    queryKey: ["playlists", PlaylistService.get, userId, level.id],
    queryFn: async () => PlaylistService.get(userId, level.id),
  });

  if (playlistItemResult.isLoading) {
    return <></>;
  }

  const playlistItem = playlistItemResult?.data;

  return (
    <PlaylistItemFormView
      userId={userId}
      level={level}
      playlistItem={playlistItem}
      onSubmit={onSubmit}
      onNavigateToMyPlaylist={onNavigateToMyPlaylist}
    />
  );
};

export { PlaylistItemForm };
