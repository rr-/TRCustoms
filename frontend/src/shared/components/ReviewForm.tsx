import "./ReviewForm.css";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { AxiosError } from "axios";
import axios from "axios";
import { Field } from "formik";
import { useFormikContext } from "formik";
import { Formik } from "formik";
import { Form } from "formik";
import { property } from "lodash";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import type { ReviewTemplateQuestion } from "src/services/config.service";
import type { ReviewTemplateAnswer } from "src/services/config.service";
import type { LevelNested } from "src/services/level.service";
import type { ReviewDetails } from "src/services/review.service";
import { ReviewService } from "src/services/review.service";
import { FormGrid } from "src/shared/components/FormGrid";
import { FormGridType } from "src/shared/components/FormGrid";
import { FormGridButtons } from "src/shared/components/FormGrid";
import { FormGridFieldSet } from "src/shared/components/FormGrid";
import { Loader } from "src/shared/components/Loader";
import { BaseFormField } from "src/shared/components/formfields/BaseFormField";
import { TextAreaFormField } from "src/shared/components/formfields/TextAreaFormField";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { ConfigContext } from "src/shared/contexts/ConfigContext";
import { filterFalsyObjectValues } from "src/shared/utils";
import { makeSentence } from "src/shared/utils";
import { validateRequired } from "src/shared/utils";
import { extractNestedErrorText } from "src/shared/utils";

interface ReviewFormProps {
  level: LevelNested;
  review?: ReviewDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((review: ReviewDetails) => void) | undefined;
}

interface ReviewQuestionFormFieldProps {
  name: string;
  readonly?: boolean | undefined;
  templateQuestion: ReviewTemplateQuestion;
}

const ReviewQuestionFormField = ({
  templateQuestion,
  name,
  readonly,
}: ReviewQuestionFormFieldProps) => {
  const { values, setFieldValue } = useFormikContext();

  const handleAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    templateAnswer: ReviewTemplateAnswer
  ) => {
    setFieldValue(name, event.target.checked ? templateAnswer.id : null);
  };

  const validateAnswer = (value: number | null) => {
    if (value === null) {
      return "This field is required.";
    }
    return null;
  };

  return (
    <BaseFormField
      required={true}
      name={name}
      label={`${templateQuestion.position + 1}. ${
        templateQuestion.question_text
      }`}
    >
      {templateQuestion.answers.map((templateAnswer) => (
        <div
          key={templateAnswer.id}
          className="ReviewQuestionFormField--answerRow"
        >
          <label>
            <Field
              name={name}
              validate={validateAnswer}
              disabled={readonly}
              type="radio"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleAnswerChange(event, templateAnswer)
              }
              checked={property(name)(values) === templateAnswer.id}
            />
            {templateAnswer.answer_text}
          </label>
        </div>
      ))}
    </BaseFormField>
  );
};

const ReviewForm = ({ level, review, onGoBack, onSubmit }: ReviewFormProps) => {
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);
  const initialValues = {
    text: review?.text || "",
    answers: Object.fromEntries(
      config.review_questions.map((templateQuestion) => [
        templateQuestion.id,
        review?.answers?.filter((answerId) =>
          templateQuestion.answers
            .map((templateAnswer) => templateAnswer.id)
            .includes(answerId)
        )?.[0] || null,
      ])
    ),
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
          text: data?.text,
          answers: extractNestedErrorText(data?.answer_ids),
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
          levelId: level.id,
          text: values.text,
          answerIds: Object.values(values.answers) as number[],
        };

        if (review?.id) {
          let outReview = await ReviewService.update(review.id, payload);
          queryClient.removeQueries("levels");
          queryClient.removeQueries("reviews");
          queryClient.removeQueries("snapshots");
          onSubmit?.(outReview);

          setStatus({
            success: (
              <>
                Review updated. <LevelLink level={level}>Click here</LevelLink>{" "}
                to see the changes.
              </>
            ),
          });
        } else {
          let outReview = await ReviewService.create(payload);
          queryClient.removeQueries("levels");
          queryClient.removeQueries("reviews");
          queryClient.removeQueries("snapshots");
          onSubmit?.(outReview);

          setStatus({
            success: (
              <>
                Review posted. <LevelLink level={level}>Click here</LevelLink>{" "}
                to go back to the level page.
              </>
            ),
          });
        }
      } catch (error) {
        handleSubmitError(error, { setSubmitting, setStatus, setErrors });
      }
    },
    [level, review, onSubmit, handleSubmitError, queryClient]
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
              <FormGridFieldSet title="Review">
                <TextAreaFormField
                  validate={validateRequired}
                  required={true}
                  label="Review text"
                  name="text"
                />
              </FormGridFieldSet>

              <FormGridFieldSet title="Questionnaire">
                <p className="ReviewForm--questionnaireDisclaimer">
                  <InformationCircleIcon className="icon" /> The results of this
                  questionnaire will aggregate a hidden score that contributes
                  to the average rating.
                </p>

                {config.review_questions.map((templateQuestion) => (
                  <ReviewQuestionFormField
                    key={templateQuestion.id}
                    name={`answers.${templateQuestion.id}`}
                    templateQuestion={templateQuestion}
                  />
                ))}
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
