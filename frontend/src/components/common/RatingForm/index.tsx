import { AxiosError } from "axios";
import axios from "axios";
import type { FormikHelpers } from "formik";
import { useFormikContext } from "formik";
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
import { BaseFormField } from "src/components/formfields/BaseFormField";
import { RadioboxFormField } from "src/components/formfields/RadioboxFormField";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { LevelLink } from "src/components/links/LevelLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { RatingTemplateQuestion } from "src/services/ConfigService";
import type { RatingTemplateAnswer } from "src/services/ConfigService";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { extractNestedErrorText } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { validateRequired } from "src/utils/validation";

interface RatingFormProps {
  level: LevelNested;
  rating?: RatingDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((rating: RatingDetails) => void) | undefined;
}

interface RatingFormValues {
  answers: Record<string, number | null>;
}

interface RatingQuestionFormFieldProps {
  name: string;
  readonly?: boolean | undefined;
  templateQuestion: RatingTemplateQuestion;
}

const RatingQuestionFormField = ({
  templateQuestion,
  name,
  readonly,
}: RatingQuestionFormFieldProps) => {
  const { setFieldValue } = useFormikContext();

  const handleAnswerChange = (
    templateAnswer: RatingTemplateAnswer,
    checked: boolean
  ) => {
    setFieldValue(name, checked ? templateAnswer.id : null);
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
        <div key={templateAnswer.id}>
          <RadioboxFormField
            label={templateAnswer.answer_text}
            name={name}
            required={true}
            readonly={readonly}
            hideErrors={true} /* handled by parent BaseFormField */
            onChange={(checked: boolean) =>
              handleAnswerChange(templateAnswer, checked)
            }
            id={templateAnswer.id}
          />
        </div>
      ))}
    </BaseFormField>
  );
};

const RatingForm = ({ level, rating, onGoBack, onSubmit }: RatingFormProps) => {
  const queryClient = useQueryClient();
  const { config } = useContext(ConfigContext);
  const initialValues: RatingFormValues = {
    answers: Object.fromEntries(
      config.rating_questions.map((templateQuestion) => [
        templateQuestion.id,
        rating?.answers?.filter((answerId) =>
          templateQuestion.answers
            .map((templateAnswer) => templateAnswer.id)
            .includes(answerId)
        )?.[0] || null,
      ])
    ),
  };

  const validate = (values: { [key: string]: any }) => {
    const errors: Record<string, string> = {};

    for (let templateQuestion of config.rating_questions) {
      const validator = validateRequired;
      const value = values.answers?.[templateQuestion.id];
      const error = validator(value);
      if (error) {
        errors[templateQuestion.id] = makeSentence(error);
      }
    }

    return Object.keys(errors).length ? { answers: errors } : {};
  };

  const handleSubmitError = useCallback(
    (
      error: unknown,
      { setSubmitting, setStatus, setErrors }: FormikHelpers<RatingFormValues>
    ) => {
      setSubmitting(false);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const data = axiosError.response?.data;
        if (data.detail) {
          setStatus({ error: <>{makeSentence(data.detail)}</> });
        }
        const errors = {
          answers: extractNestedErrorText(data?.answer_ids),
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
    []
  );

  const handleSubmit = useCallback(
    async (
      values: RatingFormValues,
      helpers: FormikHelpers<RatingFormValues>
    ) => {
      const { setStatus } = helpers;
      setStatus({});
      try {
        const payload = {
          levelId: level.id,
          answerIds: Object.values(values.answers) as number[],
        };

        if (rating?.id) {
          let outRating = await RatingService.update(rating.id, payload);
          resetQueries(queryClient, ["levels", "ratings"], true);
          resetQueries(queryClient, ["auditLogs"]);
          onSubmit?.(outRating);

          setStatus({
            success: (
              <>
                Rating updated.{" "}
                <LevelLink subPage="ratings" level={level}>
                  Click here
                </LevelLink>{" "}
                to see the changes.
              </>
            ),
          });
        } else {
          let outRating = await RatingService.create(payload);
          resetQueries(queryClient, ["levels", "ratings", "auditLogs"]);
          onSubmit?.(outRating);

          setStatus({
            success: (
              <>
                Rating posted.{" "}
                <LevelLink subPage="ratings" level={level}>
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
    [level, rating, onSubmit, handleSubmitError, queryClient]
  );

  if (!config) {
    return <Loader />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue, status }) =>
        status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form>
            <FormGrid gridType={FormGridType.Column}>
              <FormGridFieldSet title="Questionnaire">
                <InfoMessage type={InfoMessageType.Info}>
                  The results of this questionnaire will aggregate a hidden
                  score that contributes to the average rating.
                </InfoMessage>

                {config.rating_questions.map((templateQuestion) => (
                  <RatingQuestionFormField
                    key={templateQuestion.id}
                    name={`answers.${templateQuestion.id}`}
                    templateQuestion={templateQuestion}
                  />
                ))}
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {rating ? "Update rating" : "Submit rating"}
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

export { RatingForm };
