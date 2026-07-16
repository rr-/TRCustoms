import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { FilePicker } from "src/components/common/FilePicker";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PicturePicker } from "src/components/common/PicturePicker";
import { BaseField } from "src/components/forms/BaseField";
import { DifficultyField } from "src/components/forms/DifficultyField";
import { DurationField } from "src/components/forms/DurationField";
import { EngineField } from "src/components/forms/EngineField";
import { ExternalLinksField } from "src/components/forms/ExternalLinksField";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { GenresField } from "src/components/forms/GenresField";
import { TagsField } from "src/components/forms/TagsField";
import { TextAreaField } from "src/components/forms/TextAreaField";
import { TextField } from "src/components/forms/TextField";
import { UsersField } from "src/components/forms/UsersField";
import type { FormResult } from "src/components/forms/useFormSubmit";
import { LevelLink } from "src/components/links/LevelLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { UserContext } from "src/contexts/UserContext";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { GenreNested } from "src/services/GenreService";
import type { ExternalLink } from "src/services/LevelService";
import { ExternalLinkType } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { TagNested } from "src/services/TagService";
import type { UserNested } from "src/services/UserService";
import { DisplayMode } from "src/types";
import { extractNestedErrorText } from "src/utils/misc";
import { getResponseError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { pluralize } from "src/utils/string";
import { validateMaxLength } from "src/utils/validation";
import { validateRequired } from "src/utils/validation";

interface LevelFormProps {
  level?: LevelDetails | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((level: LevelDetails) => void) | undefined;
}

const validateRange = <T extends Object>(
  value: T[],
  noun: string,
  minCount: number | null,
  maxCount: number | null,
): string | null => {
  if (minCount !== null && value.length < minCount) {
    return `At least ${minCount} ${pluralize(noun, minCount)} must be added`;
  }
  if (maxCount !== null && value.length > maxCount) {
    return `At most ${maxCount} ${pluralize(noun, maxCount)} can be added`;
  }
  return null;
};

const UploadDisclaimer = () => {
  return (
    <InfoMessage type={InfoMessageType.Info}>
      Before uploading, ensure that your level has been tested properly.
      <br />
      Don't use uncompressed formats like AVI or WAV files unless you have to.
    </InfoMessage>
  );
};

interface LevelFormValues {
  name: string;
  description: string;
  genres: GenreNested[];
  external_links: ExternalLink[];
  authors: UserNested[];
  tags: TagNested[];
  engine_id: number | undefined;
  difficulty_id: number | undefined;
  duration_id: number | undefined;
  cover_id: number | undefined;
  screenshot_ids: number[];
  file_id: number | undefined;
}

const LevelForm = ({ level, onGoBack, onSubmit }: LevelFormProps) => {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);
  const [result, setResult] = useState<FormResult | null>(null);

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

  // The validators depend on the config limits and whether we are editing;
  // read them through refs so a stable resolver always sees current values.
  const configRef = useRef(config);
  configRef.current = config;
  const isEditRef = useRef(!!level);
  isEditRef.current = !!level;

  const resolver: Resolver<LevelFormValues> = (values) => {
    const limits = configRef.current.limits;
    const errors: Record<string, { type: string; message: string }> = {};
    const setError = (field: string, message: string) => {
      if (!errors[field]) {
        errors[field] = { type: "validate", message: makeSentence(message) };
      }
    };

    const validatorMap: {
      [field: string]: Array<(value: any) => string | null>;
    } = {
      name: [validateRequired, validateMaxLength(100)],
      genres: [
        (v) => validateRange(v, "genre", limits.min_genres, limits.max_genres),
      ],
      external_links: [
        (v: ExternalLink[]) =>
          validateRange(
            v.filter((link) => link.link_type === ExternalLinkType.Showcase),
            "YouTube link",
            limits.min_showcase_links,
            limits.max_showcase_links,
          ) ||
          validateRange(
            v.filter((link) => link.link_type === ExternalLinkType.Main),
            "website link",
            0,
            1,
          ),
      ],
      tags: [(v) => validateRange(v, "tag", limits.min_tags, limits.max_tags)],
      authors: [
        (v) =>
          validateRange(v, "author", limits.min_authors, limits.max_authors),
      ],
      description: [validateRequired, validateMaxLength(5000)],
      engine_id: [validateRequired],
      duration_id: [validateRequired],
      difficulty_id: [validateRequired],
      cover_id: [validateRequired],
      screenshot_ids: [
        (v) =>
          validateRange(
            v,
            "screenshot",
            limits.min_screenshots,
            limits.max_screenshots,
          ),
      ],
      file_id: isEditRef.current ? [] : [validateRequired],
    };

    for (const [field, validators] of Object.entries(validatorMap)) {
      for (const validator of validators) {
        const error = validator((values as Record<string, any>)[field]);
        if (error) {
          setError(field, error);
          break;
        }
      }
    }

    // special case: screenshots and showcase links share one media limit.
    const mediaError = validateRange(
      [
        ...values.screenshot_ids,
        ...values.external_links.filter(
          (link) => link.link_type === ExternalLinkType.Showcase,
        ),
      ],
      "media",
      limits.min_screenshots,
      limits.max_screenshots,
    );
    if (mediaError) {
      setError("screenshot_ids", mediaError);
      setError("external_links", mediaError);
    }

    return {
      values: Object.keys(errors).length ? {} : values,
      errors: errors as any,
    };
  };

  const form = useForm<LevelFormValues>({
    resolver,
    defaultValues: initialValues,
  });

  // Mirror Formik's enableReinitialize when a level loads.
  const { reset } = form;
  useEffect(() => {
    reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.id]);

  const applyServerError = (data: Record<string, any>): boolean => {
    const externalLinkErrors = extractNestedErrorText(data.external_links);
    const fieldErrors: { [field: string]: unknown } = {
      name: data.name,
      description: data.description,
      genres: data.genre_ids,
      external_links: externalLinkErrors.length ? externalLinkErrors : null,
      authors: data.author_ids,
      tags: data.tag_ids,
      engine_id: data.engine_id,
      difficulty_id: data.difficulty_id,
      duration_id: data.duration_id,
      cover_id: data.cover_id,
      screenshot_ids: data.screenshot_ids,
      file_id: data.file_id,
    };
    let applied = false;
    for (const [field, value] of Object.entries(fieldErrors)) {
      const message = Array.isArray(value) ? value[0] : value;
      if (message) {
        form.setError(field as keyof LevelFormValues, {
          type: "server",
          message: makeSentence(String(message)),
        });
        applied = true;
      }
    }
    return applied;
  };

  const submit = form.handleSubmit(async (values) => {
    setResult(null);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        engine_id: values.engine_id,
        duration_id: values.duration_id,
        difficulty_id: values.difficulty_id,
        genre_ids: values.genres.map((genre) => genre.id),
        external_links: values.external_links.map((link, i) => ({
          ...link,
          position: i,
        })),
        author_ids: values.authors.map((author) => author.id),
        tag_ids: values.tags.map((tag) => tag.id),
        cover_id: values.cover_id,
        screenshot_ids: values.screenshot_ids,
        file_id: values.file_id,
      };

      if (level?.id) {
        const outLevel = await LevelService.update(level.id, payload);
        resetQueries(queryClient, ["levels", "auditLogs"]);
        onSubmit?.(outLevel);
        setResult({
          success: (
            <>
              Level information updated.{" "}
              <LevelLink level={outLevel}>Click here</LevelLink> to see the
              changes.
            </>
          ),
        });
      } else {
        const outLevel = await LevelService.create(payload);
        resetQueries(queryClient, ["levels", "auditLogs"]);
        onSubmit?.(outLevel);
      }
    } catch (error) {
      const data = getResponseError(error);
      if (data?.detail) {
        setResult({ error: <>{makeSentence(data.detail)}</> });
      }
      if (!data || (!applyServerError(data) && !data.detail)) {
        console.error(error);
        setResult({ error: <>Unknown error.</> });
      }
    }
  });

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
