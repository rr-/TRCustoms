import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { UploadType } from "src/services/file.service";
import { GenreNested } from "src/services/genre.service";
import type { ExternalLink } from "src/services/level.service";
import { ExternalLinkType } from "src/services/level.service";
import type { LevelDetails } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { TagNested } from "src/services/tag.service";
import type { UserNested } from "src/services/user.service";
import { FilePicker } from "src/shared/components/FilePicker";
import { FormGrid } from "src/shared/components/FormGrid";
import { FormGridButtons } from "src/shared/components/FormGrid";
import { FormGridFieldSet } from "src/shared/components/FormGrid";
import { PicturePicker } from "src/shared/components/PicturePicker";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import { DifficultyFormField } from "src/shared/components/formfields/DifficultyFormField";
import { DurationFormField } from "src/shared/components/formfields/DurationFormField";
import { EngineFormField } from "src/shared/components/formfields/EngineFormField";
import { ExternalLinksFormField } from "src/shared/components/formfields/ExternalLinksFormField";
import { GenresFormField } from "src/shared/components/formfields/GenresFormField";
import { TagsFormField } from "src/shared/components/formfields/TagsFormField";
import { TextAreaFormField } from "src/shared/components/formfields/TextAreaFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";
import { UsersFormField } from "src/shared/components/formfields/UsersFormField";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { ConfigContext } from "src/shared/contexts/ConfigContext";
import { UserContext } from "src/shared/contexts/UserContext";
import { DisplayMode } from "src/shared/types";
import { filterFalsyObjectValues } from "src/shared/utils";
import { makeSentence } from "src/shared/utils";
import { validateRequired } from "src/shared/utils";
import { extractNestedErrorText } from "src/shared/utils";
import { pluralize } from "src/shared/utils";

interface LevelFormProps {
  level?: LevelDetails | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((level: LevelDetails) => void) | undefined;
}

const validateRange = <T extends Object>(
  value: T[],
  noun: string,
  minCount: number | null,
  maxCount: number | null
): string | null => {
  if (minCount !== null && value.length < minCount) {
    return `At least ${minCount} ${pluralize(noun, minCount)} must be added`;
  }
  if (maxCount !== null && value.length > maxCount) {
    return `At most ${maxCount} ${pluralize(noun, maxCount)} can be added`;
  }
  return null;
};

const LevelForm = ({ level, onGoBack, onSubmit }: LevelFormProps) => {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);
  const initialValues = {
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
      ? [...level.screenshots.map((screenshot) => screenshot.file.id)]
      : [],
    file_id: null,
  };

  const validateGenres = (value: number[]): string | null => {
    return validateRange(
      value,
      "genre",
      config.limits.min_genres,
      config.limits.max_genres
    );
  };

  const validateExternalLinks = (value: ExternalLink[]): string | null => {
    return (
      validateRange(
        value.filter((link) => link.link_type === ExternalLinkType.Showcase),
        "showcase link",
        config.limits.min_showcase_links,
        config.limits.max_showcase_links
      ) ||
      validateRange(
        value.filter((link) => link.link_type === ExternalLinkType.Main),
        "main link",
        0,
        1
      )
    );
  };

  const validateAuthors = (value: number[]): string | null => {
    return validateRange(
      value,
      "author",
      config.limits.min_authors,
      config.limits.max_authors
    );
  };

  const validateTags = (value: number[]): string | null => {
    return validateRange(
      value,
      "tag",
      config.limits.min_tags,
      config.limits.max_tags
    );
  };

  const validateScreenshots = (value: number[]): string | null => {
    return validateRange(
      value,
      "screnshot",
      config.limits.min_screenshots,
      config.limits.max_screenshots
    );
  };

  const handleSubmitError = useCallback(
    (error, { setSubmitting, setStatus, setErrors }) => {
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
    []
  );

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        const payload = {
          name: values.name,
          description: values.description,
          engine_id: values.engine_id,
          duration_id: values.duration_id,
          difficulty_id: values.difficulty_id,
          genre_ids: values.genres.map((genre: GenreNested) => genre.id),
          external_links: values.external_links.map(
            (link: ExternalLink, i: number) => ({ ...link, position: i })
          ),
          author_ids: values.authors.map((author: UserNested) => author.id),
          tag_ids: values.tags.map((tag: TagNested) => tag.id),
          cover_id: values.cover_id,
          screenshot_ids: values.screenshot_ids,
          file_id: values.file_id,
        };

        if (level?.id) {
          let outLevel = await LevelService.update(level.id, payload);
          queryClient.removeQueries("levels");
          queryClient.removeQueries("snapshots");
          onSubmit?.(outLevel);

          setStatus({
            success: (
              <>
                Level information updated.{" "}
                <LevelLink level={outLevel} label="Click here" /> to see the
                changes.
              </>
            ),
          });
        } else {
          let outLevel = await LevelService.create(payload);
          queryClient.removeQueries("levels");
          queryClient.removeQueries("snapshots");
          onSubmit?.(outLevel);
        }
      } catch (error) {
        handleSubmitError(error, { setSubmitting, setStatus, setErrors });
      }
    },
    [level, onSubmit, handleSubmitError, queryClient]
  );

  const validate = (values: { [key: string]: any }) => {
    const errors: {
      [key: string]: string | null;
    } = {};

    const validatorMap = {
      name: [validateRequired],
      genres: [validateGenres],
      external_links: [validateExternalLinks],
      tags: [validateTags],
      authors: [validateAuthors],
      description: [validateRequired],
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
        }
        break;
      }
    }

    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, status }) =>
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
                  required={true}
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
                    onChange={([fileId]) =>
                      setFieldValue("cover_id", fileId || null)
                    }
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
                            ...level.screenshots.map(
                              (screenshot) => screenshot.file.id
                            ),
                          ]
                        : []
                    }
                    onChange={(fileIds) =>
                      setFieldValue("screenshot_ids", fileIds)
                    }
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

              <FormGridFieldSet title="File">
                <BaseFormField
                  required={true}
                  label="Level file"
                  name="file_id"
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
