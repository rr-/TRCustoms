import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FilePicker } from "src/components/common/FilePicker";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PicturePicker } from "src/components/common/PicturePicker";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { buildLevelPayload } from "src/components/forms/LevelForm/schema";
import { buildSchema } from "src/components/forms/LevelForm/schema";
import type { LevelFormValues } from "src/components/forms/LevelForm/schema";
import { applyLevelServerErrors } from "src/components/forms/LevelForm/serverErrors";
import { BaseField } from "src/components/forms/fields/BaseField";
import { DifficultyField } from "src/components/forms/fields/DifficultyField";
import { DurationField } from "src/components/forms/fields/DurationField";
import { EngineField } from "src/components/forms/fields/EngineField";
import { ExternalLinksField } from "src/components/forms/fields/ExternalLinksField";
import { GenresField } from "src/components/forms/fields/GenresField";
import { TagsField } from "src/components/forms/fields/TagsField";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { TextField } from "src/components/forms/fields/TextField";
import { UsersField } from "src/components/forms/fields/UsersField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { LevelLink } from "src/components/links/LevelLink";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { queryKeys } from "src/services/queryKeys";
import { useConfig } from "src/stores/config";
import { useUser } from "src/stores/user";
import { DisplayMode } from "src/types";
import { resetQueries } from "src/utils/misc";

interface LevelFormProps {
  level?: LevelDetails | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((level: LevelDetails) => void) | undefined;
}

const UploadDisclaimer = () => {
  return (
    <InfoMessage type={InfoMessageType.Info}>
      Before uploading, ensure that your level has been tested properly.
      <br />
      Don't use uncompressed formats like AVI or WAV files unless you have to.
    </InfoMessage>
  );
};

const LevelForm = ({ level, onGoBack, onSubmit }: LevelFormProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { config } = useConfig();

  const initialValues: LevelFormValues = {
    name: level?.name || "",
    description: level?.description || "",
    genres: level ? [...level.genres] : [],
    external_links: level ? [...(level.external_links ?? [])] : [],
    authors: level ? [...level.authors] : user ? [user] : [],
    tags: level ? [...level.tags] : [],
    engine_id: level?.engine?.id,
    difficulty_id: level?.difficulty?.id,
    duration_id: level?.duration?.id,
    cover_id: level?.cover?.id,
    screenshot_ids: level
      ? level.screenshots
          .filter((screenshot) => screenshot.file)
          .map((screenshot) => (screenshot.file as UploadedFile).id)
      : [],
    file_id: undefined,
  };

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(buildSchema(config.limits, !!level)),
    defaultValues: initialValues,
  });

  // Refill the form when a level loads.
  const { reset } = form;
  useEffect(() => {
    reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.id]);

  // On the create form the current user is the default author, but the user
  // context may resolve after mount — fill it in when it arrives, without
  // clobbering an author the uploader has already picked.
  const { setValue, getValues } = form;
  useEffect(() => {
    if (!level && user && getValues("authors").length === 0) {
      setValue("authors", [user]);
    }
  }, [level, user, setValue, getValues]);

  const { submit, result } = useFormSubmit(
    form,
    async (values) => {
      const payload = buildLevelPayload(values);

      if (level?.id) {
        const outLevel = await LevelService.update(level.id, payload);
        resetQueries(queryClient, [
          queryKeys.levels.all,
          queryKeys.auditLogs.all,
        ]);
        onSubmit?.(outLevel);
        return {
          success: (
            <>
              Level information updated.{" "}
              <LevelLink level={outLevel}>Click here</LevelLink> to see the
              changes.
            </>
          ),
        };
      }
      const outLevel = await LevelService.create(payload);
      resetQueries(queryClient, [
        queryKeys.levels.all,
        queryKeys.auditLogs.all,
      ]);
      onSubmit?.(outLevel);
    },
    applyLevelServerErrors,
  );

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet title="Basic information">
          <TextField
            readonly={!!level}
            required={true}
            label="Name"
            name="name"
          />
          <GenresField
            required={config.limits.min_genres > 0}
            label="Genres"
            name="genres"
          />
          <TagsField
            required={config.limits.min_tags > 0}
            label="Tags"
            name="tags"
          />
          <UsersField
            required={config.limits.min_authors > 0}
            label="Authors"
            name="authors"
          />
          <EngineField required={true} label="Engine" name="engine_id" />
          <DifficultyField
            required={true}
            label="Difficulty"
            name="difficulty_id"
          />
          <DurationField required={true} label="Duration" name="duration_id" />
        </FormGridFieldSet>

        <FormGridFieldSet title="Synopsis">
          <TextAreaField
            rich={true}
            required={true}
            allowColors={false}
            label="Description"
            markdownLimitKey="level_description"
            name="description"
          />
        </FormGridFieldSet>

        <FormGridFieldSet title="Showcase">
          <BaseField required={true} label="Cover image" name="cover_id">
            <PicturePicker
              displayMode={DisplayMode.Cover}
              label={
                <>
                  Drop an image here, or click on this box.
                  <br />
                  The image will be cropped to 4:3 aspect ratio.
                </>
              }
              allowMultiple={false}
              allowClear={true}
              uploadType={UploadType.LevelCover}
              fileIds={level?.cover ? [level?.cover.id] : []}
              onChange={([fileId]) =>
                form.setValue("cover_id", fileId || undefined, {
                  shouldValidate: true,
                })
              }
            />
          </BaseField>

          <BaseField
            required={config.limits.min_screenshots > 0}
            label="Screenshots"
            name="screenshot_ids"
          >
            <PicturePicker
              displayMode={DisplayMode.Contain}
              allowMultiple={true}
              allowClear={true}
              uploadType={UploadType.LevelScreenshot}
              fileIds={
                level
                  ? level.screenshots
                      .filter((screenshot) => screenshot.file)
                      .map((screenshot) => (screenshot.file as UploadedFile).id)
                  : []
              }
              onChange={(fileIds) =>
                form.setValue("screenshot_ids", fileIds, {
                  shouldValidate: true,
                })
              }
            />
          </BaseField>

          <ExternalLinksField
            required={false}
            label="External links"
            name="external_links"
          />
        </FormGridFieldSet>

        <FormGridFieldSet
          title={level?.id ? "File version update" : "File"}
          header={<UploadDisclaimer />}
        >
          <BaseField
            required={!level?.id}
            label="Level file"
            name="file_id"
            extraInformation={
              level
                ? "Leave empty to keep the current file version."
                : undefined
            }
          >
            <FilePicker
              allowMultiple={false}
              allowClear={true}
              uploadType={UploadType.LevelFile}
              fileIds={form.watch("file_id") ? [form.watch("file_id")!] : []}
              onChange={([fileId]) =>
                form.setValue("file_id", fileId || undefined, {
                  shouldValidate: true,
                })
              }
            />
          </BaseField>
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            {level ? "Update level" : "Create"}
          </button>
          {onGoBack && (
            <button type="button" onClick={onGoBack}>
              Go back
            </button>
          )}
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { LevelForm };
