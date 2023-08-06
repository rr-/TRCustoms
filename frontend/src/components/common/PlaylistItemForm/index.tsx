import { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { useQuery } from "react-query";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { Link } from "src/components/common/Link";
import { DropDownFormField } from "src/components/formfields/DropDownFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import type { LevelNested } from "src/services/LevelService";
import type { PlaylistItemDetails } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import type { UserNested } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { validateRequired } from "src/utils/validation";

interface UserFormProps {
  user: UserNested;
  level: LevelNested;
  onSubmit?: (() => void) | undefined;
}

interface PlaylistItemFormValues {
  levelName?: string;
  status?: PlaylistItemStatus;
}

const PlaylistItemForm = ({ user, level, onSubmit }: UserFormProps) => {
  const playlistItemResult = useQuery<PlaylistItemDetails, Error>(
    ["playlists", PlaylistService.get, user?.id, level.id],
    async () => PlaylistService.get(user?.id, level.id)
  );

  const playlistItem = playlistItemResult?.data;

  const initialValues: PlaylistItemFormValues = {
    levelName: level?.name,
    status: playlistItem?.status,
  };

  const handleSubmitError = useCallback(
    (
      error: unknown,
      {
        setSubmitting,
        setStatus,
        setErrors,
      }: FormikHelpers<PlaylistItemFormValues>
    ) => {
      setSubmitting(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const data = axiosError.response?.data;
        if (data.detail) {
          setStatus({ error: <>{makeSentence(data.detail)}</> });
        }
        const errors = {
          status: data?.status,
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

  const validate = (values: { [key: string]: any }) => {
    const errors: {
      [key: string]: string | null;
    } = {};

    const validatorMap: {
      [field: string]: Array<(value: any) => string | null>;
    } = {
      status: [validateRequired],
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

    return errors;
  };

  const handleSubmit = useCallback(
    async (
      values: PlaylistItemFormValues,
      helpers: FormikHelpers<PlaylistItemFormValues>
    ) => {
      const { setStatus } = helpers;
      setStatus({});

      try {
        if (playlistItem?.id && values.status) {
          const payload = {
            status: values.status,
          };
          await PlaylistService.update(user.id, playlistItem?.id, payload);
        } else if (level && values.status) {
          const payload = {
            levelId: level.id,
            status: values.status,
          };
          await PlaylistService.create(user.id, payload);
        }

        setStatus({
          success: (
            <>
              <span className="FormFieldSuccess">Playlist updated.</span>
              <br />
              <br />
              <Link to={`/users/${user.id}/playlist`}>Click here</Link> to see
              your playlist.
            </>
          ),
        });
        onSubmit?.();
      } catch (error) {
        handleSubmitError(error, helpers);
      }
    },
    [user, level, playlistItem, onSubmit, handleSubmitError]
  );

  const statusOptions = [
    { label: "Not yet played", value: PlaylistItemStatus.NotYetPlayed },
    { label: "Playing", value: PlaylistItemStatus.Playing },
    { label: "Finished", value: PlaylistItemStatus.Finished },
    { label: "Dropped", value: PlaylistItemStatus.Dropped },
    { label: "On hold", value: PlaylistItemStatus.OnHold },
  ];

  if (playlistItemResult.isLoading) {
    return <></>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue, status }) =>
        status?.success ? (
          status.success
        ) : (
          <Form>
            <FormGrid>
              <FormGridFieldSet>
                <TextFormField label="Level" name="levelName" readonly={true} />
              </FormGridFieldSet>

              <FormGridFieldSet>
                <DropDownFormField
                  label="Status"
                  name="status"
                  allowNull={false}
                  options={statusOptions}
                />
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {playlistItem ? "Update" : "Save"}
                </button>
              </FormGridButtons>
            </FormGrid>
          </Form>
        )
      }
    </Formik>
  );
};

export { PlaylistItemForm };
