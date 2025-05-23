import { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Loader } from "src/components/common/Loader";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { LevelLink } from "src/components/links/LevelLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { LevelNested } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { validateRequired } from "src/utils/validation";

interface ReviewFormProps {
  level: LevelNested;
  review?: ReviewDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((review: ReviewDetails) => void) | undefined;
}

interface ReviewFormValues {
  text: string;
}

const ReviewForm = ({ level, review, onGoBack, onSubmit }: ReviewFormProps) => {
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);
  const initialValues: ReviewFormValues = {
    text: review?.text || "",
  };

  const handleSubmitError = useCallback(
    (
      error: unknown,
      { setSubmitting, setStatus, setErrors }: FormikHelpers<ReviewFormValues>,
    ) => {
      setSubmitting(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const data = axiosError.response?.data;
        if (data.detail) {
          setStatus({ error: <>{makeSentence(data.detail)}</> });
        }
        const errors = {
          text: data?.text,
        };
        if (Object.keys(filterFalsyObjectValues(errors)).length) {
          setErrors(errors as any);
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
      values: ReviewFormValues,
      helpers: FormikHelpers<ReviewFormValues>,
    ) => {
      const { setStatus } = helpers;
      setStatus({});
      try {
        const payload = {
          levelId: level.id,
          text: values.text,
        };

        if (review?.id) {
          let outReview = await ReviewService.update(review.id, payload);
          resetQueries(queryClient, ["levels", "reviews"], true);
          resetQueries(queryClient, ["auditLogs"]);
          onSubmit?.(outReview);

          setStatus({
            success: (
              <>
                Review updated.{" "}
                <LevelLink subPage="reviews" level={level}>
                  Click here
                </LevelLink>{" "}
                to see the changes.
              </>
            ),
          });
        } else {
          let outReview = await ReviewService.create(payload);
          resetQueries(queryClient, ["levels", "reviews", "auditLogs"]);
          onSubmit?.(outReview);

          setStatus({
            success: (
              <>
                Review posted.{" "}
                <LevelLink subPage="reviews" level={level}>
                  Click here
                </LevelLink>{" "}
                to go back to the level page.
              </>
            ),
          });
        }
      } catch (error) {
        handleSubmitError(error, helpers);
      }
    },
    [level, review, onSubmit, handleSubmitError, queryClient],
  );

  if (!config) {
    return <Loader />;
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, status }) =>
        status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form>
            <FormGrid gridType={FormGridType.Column}>
              <FormGridFieldSet>
                <InfoMessage type={InfoMessageType.Info}>
                  Remember to stay respectful and constructive, and avoid
                  excessive profanity.
                  <br />
                  The review needs to be written in English.
                </InfoMessage>

                <TextAreaFormField
                  validate={validateRequired}
                  rich={true}
                  required={true}
                  allowColors={false}
                  label="Review text"
                  name="text"
                />
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {review ? "Update review" : "Submit review"}
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

export { ReviewForm };
