import { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { useRef } from "react";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { FilePicker } from "src/components/common/FilePicker";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PicturePicker } from "src/components/common/PicturePicker";
import { BaseFormField } from "src/components/formfields/BaseFormField";
import { DifficultyFormField } from "src/components/formfields/DifficultyFormField";
import { DurationFormField } from "src/components/formfields/DurationFormField";
import { EngineFormField } from "src/components/formfields/EngineFormField";
import { ExternalLinksFormField } from "src/components/formfields/ExternalLinksFormField";
import { GenresFormField } from "src/components/formfields/GenresFormField";
import { TagsFormField } from "src/components/formfields/TagsFormField";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { UsersFormField } from "src/components/formfields/UsersFormField";
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
import { filterFalsyObjectValues } from "src/utils/misc";
import { extractNestedErrorText } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { pluralize } from "src/utils/string";
import { validateRequired } from "src/utils/validation";
import { validateMaxLength } from "src/utils/validation";

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
  const formikRef = useRef<any>();
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);

  const initialValues: LevelFormValues = {
    name: level?.name || "",
    description: level?.description || "",
    genres: level ? [...level.genres] : [],
    external_links: level ? [...level.external_links] : [],
    authors: level ? [...level.authors] : user ? [user] : [],
    tags: level ? [...level.tags] : [],
    engine_id: level?.engine?.id,
    difficulty_id: level?.difficulty?.id,
    duration_id: level?.duration?.id,
    cover_id: level?.cover?.id,
    screenshot_ids: level
      ? [
          ...level.screenshots
            .filter((screenshot) => screenshot.file)
            .map((screenshot) => (screenshot.file as UploadedFile).id),
        ]
      : [],
    file_id: undefined,
  };

  const validateGenres = (value: number[]): string | null => {
    return validateRange(
      value,
      "genre",
      config.limits.min_genres,
      config.limits.max_genres,
    );
  };

  const validateExternalLinks = (value: ExternalLink[]): string | null => {
    return (
      validateRange(
        value.filter((link) => link.link_type === ExternalLinkType.Showcase),
        "YouTube link",
        config.limits.min_showcase_links,
        config.limits.max_showcase_links,
      ) ||
      validateRange(
        value.filter((link) => link.link_type === ExternalLinkType.Main),
        "website link",
        0,
        1,
      )
    );
  };

  const validateAuthors = (value: number[]): string | null => {
    return validateRange(
      value,
      "author",
      config.limits.min_authors,
      config.limits.max_authors,
    );
  };

  const validateTags = (value: number[]): string | null => {
    return validateRange(
      value,
      "tag",
      config.limits.min_tags,
      config.limits.max_tags,
    );
  };

  const validateScreenshots = (value: number[]): string | null => {
    return validateRange(
      value,
      "screnshot",
      config.limits.min_screenshots,
      config.limits.max_screenshots,
    );
  };

  const handleSubmitError = useCallback(
    (
      error: unknown,
      { setSubmitting, setStatus, setErrors }: FormikHelpers<LevelFormValues>,
    ) => {
      setSubmitting(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const data = axiosError.response?.data;
        if (data.detail) {
          setStatus({ error: <>{makeSentence(data.detail)}</> });
        }
        const errors = {
          name: data?.name,
          description: data?.description,
          genres: data?.genre_ids,
          external_links: extractNestedErrorText(data?.external_links),
          authors: data?.author_ids,
          tags: data?.tag_ids,
          engine_id: data?.engine_id,
          difficulty_id: data?.difficulty_id,
          duration_id: data?.duration_id,
          cover_id: data?.cover_id,
          screenshot_ids: data?.screenshot_ids || data?.screenshots,
          file_id: data?.file_id,
        };
        if (Object.keys(filterFalsyObjectValues(errors)).length) {
          setErrors(errors);
        } else {
          console.error(error);
          setStatus({ error: <>Unknown error.</> });
        }
      } else {
        console.error(error);
        setStatus({ error: <>Unknown error.</> });
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (
      values: LevelFormValues,
      helpers: FormikHelpers<LevelFormValues>,
    ) => {
      const { setStatus } = helpers;
      setStatus({});
      try {
        const payload = {
          name: values.name,
          description: values.description,
          engine_id: values.engine_id,
          duration_id: values.duration_id,
          difficulty_id: values.difficulty_id,
          genre_ids: values.genres.map((genre: GenreNested) => genre.id),
          external_links: values.external_links.map(
            (link: ExternalLink, i: number) => ({ ...link, position: i }),
          ),
          author_ids: values.authors.map((author: UserNested) => author.id),
          tag_ids: values.tags.map((tag: TagNested) => tag.id),
          cover_id: values.cover_id,
          screenshot_ids: values.screenshot_ids,
          file_id: values.file_id,
        };

        if (level?.id) {
          let outLevel = await LevelService.update(level.id, payload);
          resetQueries(queryClient, ["levels", "auditLogs"]);
          onSubmit?.(outLevel);

          setStatus({
            success: (
              <>
                Level information updated.{" "}
                <LevelLink level={outLevel}>Click here</LevelLink> to see the
                changes.
              </>
            ),
          });
        } else {
          let outLevel = await LevelService.create(payload);
          resetQueries(queryClient, ["levels", "auditLogs"]);
          onSubmit?.(outLevel);
        }
      } catch (error) {
        handleSubmitError(error, helpers);
      }
    },
    [level, onSubmit, handleSubmitError, queryClient],
  );

  const validate = (values: { [key: string]: any }) => {
    const errors: {
      [key: string]: string | null;
    } = {};

    const validatorMap = {
      name: [validateRequired, validateMaxLength(100)],
      genres: [validateGenres],
      external_links: [validateExternalLinks],
      tags: [validateTags],
      authors: [validateAuthors],
      description: [validateRequired, validateMaxLength(5000)],
      engine_id: [validateRequired],
      duration_id: [validateRequired],
      difficulty_id: [validateRequired],
      cover_id: [validateRequired],
      screenshot_ids: [validateScreenshots],
      file_id: level ? [] : [validateRequired],
    };

    for (const [field, validators] of Object.entries(validatorMap)) {
      for (let validator of validators) {
        const error = validator(values[field]);
        if (error) {
          errors[field] = makeSentence(error);
          break;
        }
      }
    }

    {
      // special case: multi-field validation
      const error = validateRange(
        [
          ...values.screenshot_ids,
          ...values.external_links?.filter(
            (link: ExternalLink) =>
              link.link_type === ExternalLinkType.Showcase,
          ),
        ],
        "media",
        config.limits.min_screenshots,
        config.limits.max_screenshots,
      );
      if (error) {
        if (!errors.screenshot_ids) {
          errors.screenshot_ids = makeSentence(error);
          formikRef.current?.setFieldTouched("screenshot_ids", true, false);
        }
        if (!errors.external_links) {
          errors.external_links = makeSentence(error);
          formikRef.current?.setFieldTouched("external_links", true, false);
        }
      }
    }

    return errors;
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      enableReinitialize={true}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldTouched, setFieldValue, status }) =>
        !level && status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form>
            <FormGrid>
              <FormGridFieldSet title="Basic information">
                <TextFormField
                  readonly={!!level}
                  required={true}
                  label="Name"
                  name="name"
                />
                <GenresFormField
                  required={config.limits.min_genres > 0}
                  label="Genres"
                  name="genres"
                  value={values.genres}
                  onChange={(value) => setFieldValue("genres", value)}
                />
                <TagsFormField
                  required={config.limits.min_tags > 0}
                  label="Tags"
                  name="tags"
                  value={values.tags}
                  onChange={(value) => setFieldValue("tags", value)}
                />
                <UsersFormField
                  required={config.limits.min_authors > 0}
                  label="Authors"
                  name="authors"
                  value={values.authors}
                  onChange={(value) => setFieldValue("authors", value)}
                />
                <EngineFormField
                  required={true}
                  label="Engine"
                  name="engine_id"
                />
                <DifficultyFormField
                  required={true}
                  label="Difficulty"
                  name="difficulty_id"
                />
                <DurationFormField
                  required={true}
                  label="Duration"
                  name="duration_id"
                />
              </FormGridFieldSet>

              <FormGridFieldSet title="Synopsis">
                <TextAreaFormField
                  rich={true}
                  required={true}
                  allowColors={false}
                  label="Description"
                  name="description"
                />
              </FormGridFieldSet>

              <FormGridFieldSet title="Showcase">
                <BaseFormField
                  required={true}
                  label="Cover image"
                  name="cover_id"
                >
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
                    onChange={([fileId]) => {
                      setFieldTouched("cover_id");
                      setFieldValue("cover_id", fileId || null);
                    }}
                  />
                </BaseFormField>

                <BaseFormField
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
                        ? [
                            ...level.screenshots
                              .filter((screenshot) => screenshot.file)
                              .map(
                                (screenshot) =>
                                  (screenshot.file as UploadedFile).id,
                              ),
                          ]
                        : []
                    }
                    onChange={(fileIds) => {
                      setFieldTouched("screenshot_ids");
                      setFieldValue("screenshot_ids", fileIds);
                    }}
                  />
                </BaseFormField>

                <ExternalLinksFormField
                  required={false}
                  label="External links"
                  name="external_links"
                  value={values.external_links}
                  setValue={(value) => setFieldValue("external_links", value)}
                />
              </FormGridFieldSet>

              <FormGridFieldSet
                title={level?.id ? "File version update" : "File"}
                header={<UploadDisclaimer />}
              >
                <BaseFormField
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
                    fileIds={values.file_id ? [values.file_id] : []}
                    onChange={([fileId]) =>
                      setFieldValue("file_id", fileId || null)
                    }
                  />
                </BaseFormField>
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {level ? "Update level" : "Create"}
                </button>
                {onGoBack && (
                  <button type="button" onClick={onGoBack}>
                    Go back
                  </button>
                )}
              </FormGridButtons>
            </FormGrid>
          </Form>
        )
      }
    </Formik>
  );
};

export { LevelForm };
