import { Dispatch, SetStateAction, useLayoutEffect } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "src/components/forms/ErrorMessage";
import formStyles from "src/components/forms/index.module.css";
import type { RatingTemplateQuestion } from "src/services/ConfigService";
import { titleCase } from "src/utils/string";

interface RatingFormValues extends Record<number, number | null> {}
type RatingFormValuesAdj = { [key: string]: string | null };

const adj = (data: RatingFormValues): RatingFormValuesAdj => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      `${key}`,
      value !== null ? String(value) : null,
    ])
  );
};

const unadj = (data: RatingFormValuesAdj): RatingFormValues => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      +key,
      value !== null ? +value : null,
    ])
  );
};

interface RatingFormPageProps {
  navigationDirection: number;
  setNavigationDirection: Dispatch<SetStateAction<number>>;
  category: string;
  questions: RatingTemplateQuestion[];
  formValues: RatingFormValues;
  onSubmit: (data: RatingFormValues) => any;
}

const RatingFormPage = ({
  navigationDirection,
  setNavigationDirection,
  category,
  questions,
  formValues,
  onSubmit,
}: RatingFormPageProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<RatingFormValuesAdj>({
    defaultValues: adj(formValues),
    mode: "onChange",
  });

  useLayoutEffect(() => {
    if (navigationDirection === 1) {
      // validate and go to next page
      formRef?.current?.requestSubmit();
    } else if (navigationDirection === -1) {
      // update the values with the current state
      onSubmit(unadj(getValues()));
    }
    setNavigationDirection(0);
  }, [navigationDirection]);

  return (
    <div className="ChildMarginClear">
      <form
        ref={formRef}
        onSubmit={handleSubmit((data) => onSubmit(unadj(data)))}
      >
        {questions.map((question) => (
          <div key={question.id} className={formStyles.field}>
            <label className={formStyles.label}>
              {question.position + 1}. {question.question_text}
            </label>

            {question.answers.map((answer) => (
              <div key={answer.id}>
                <label>
                  <input
                    key={question.position}
                    type="radio"
                    value={answer.id}
                    {...register(`${question.id}`, { required: true })}
                  />
                  {answer.answer_text}
                </label>
              </div>
            ))}
            <ErrorMessage error={errors[`${question.id}`]} />
          </div>
        ))}
      </form>
    </div>
  );
};

export type { RatingFormValues };
export type { RatingFormValuesAdj };
export { adj, unadj };
export { RatingFormPage };
