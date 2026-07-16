import styles from "./index.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { groupBy } from "lodash";
import { last } from "lodash";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Form } from "src/components/forms/Form";
import { RadioField } from "src/components/forms/fields/RadioField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { LevelLink } from "src/components/links/LevelLink";
import type { Config } from "src/services/ConfigService";
import type { RatingTemplateQuestion } from "src/services/ConfigService";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { resetQueries } from "src/utils/misc";
import { titleCase } from "src/utils/string";
import { z } from "zod";

interface RatingFormProps {
  config: Config;
  level: LevelNested;
  rating?: RatingDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((rating: RatingDetails) => void) | undefined;
}

// One field per question, keyed by question id; the value is the chosen answer
// id. A single form spans every step of the wizard, so answers persist across
// step changes (react-hook-form keeps unmounted field values by default).
type RatingFormValues = Record<string, number>;

const buildSchema = (questions: RatingTemplateQuestion[]) =>
  z.object(
    Object.fromEntries(
      questions.map((question) => [
        String(question.id),
        z.number({ error: "Please select an answer" }),
      ]),
    ),
  );

const buildDefaults = (
  questions: RatingTemplateQuestion[],
  answerIds: number[],
): RatingFormValues => {
  const values: RatingFormValues = {};
  questions.forEach((question) => {
    const answer = question.answers.find((a) => answerIds.includes(a.id));
    if (answer) {
      values[String(question.id)] = answer.id;
    }
  });
  return values;
};

const RatingForm = ({ config, level, rating, onSubmit }: RatingFormProps) => {
  const queryClient = useQueryClient();
  const questions = config.rating_questions;

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(buildSchema(questions)),
    defaultValues: buildDefaults(questions, rating?.answers ?? []),
    mode: "onChange",
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    const payload = { levelId: level.id, answerIds: Object.values(values) };
    if (rating?.id) {
      const outRating = await RatingService.update(rating.id, payload);
      resetQueries(queryClient, ["levels", "ratings"], true);
      resetQueries(queryClient, ["auditLogs"]);
      onSubmit?.(outRating);
      return {
        final: true,
        success: (
          <>
            Rating updated.{" "}
            <LevelLink subPage="ratings" level={level}>
              Click here
            </LevelLink>{" "}
            to see the changes.
          </>
        ),
      };
    }
    const outRating = await RatingService.create(payload);
    resetQueries(queryClient, ["levels", "ratings", "auditLogs"]);
    onSubmit?.(outRating);
    return {
      final: true,
      success: (
        <>
          Rating posted.{" "}
          <LevelLink subPage="ratings" level={level}>
            Click here
          </LevelLink>{" "}
          to go back to the level page.
        </>
      ),
    };
  });

  const questionGroups = groupBy(questions, (question) => question.category);
  const categories = Object.keys(questionGroups);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  if (result?.final && result.success) {
    return <div className="FormFieldSuccess">{result.success}</div>;
  }

  const activeIndex = categories.indexOf(activeCategory);
  const isFirst = activeIndex <= 0;
  const isLast = activeCategory === last(categories);

  const goBack = () => {
    if (!isFirst) {
      setActiveCategory(categories[activeIndex - 1]);
    }
  };

  // Validate only the current step's questions before advancing; the final step
  // hands off to the form's submit handler, which validates everything.
  const goNext = async () => {
    const names = questionGroups[activeCategory].map((q) => String(q.id));
    if ((await form.trigger(names)) && !isLast) {
      setActiveCategory(categories[activeIndex + 1]);
    }
  };

  const header = (
    <header className={styles.header}>
      <ul className={styles.nav}>
        {categories.map((category, index) => (
          <li
            key={category}
            className={`${styles.navItem} ${
              category === activeCategory ? styles.active : ""
            } ${index < activeIndex ? styles.complete : ""}`}
          >
            <span className={styles.step}>
              <span className={styles.line}></span>
              <span className={styles.circle}></span>
            </span>
            <span className={styles.navItemLink}>{titleCase(category)}</span>
          </li>
        ))}
      </ul>
    </header>
  );

  /* Note: keying on the category makes React remount the step cleanly on
   * navigation; the answers themselves live in the form, not the DOM. */
  const content = (
    <div key={activeCategory} className={`${styles.content} ChildMarginClear`}>
      {(questionGroups[activeCategory] ?? []).map((question) => (
        <RadioField
          key={question.id}
          name={String(question.id)}
          label={`${question.position + 1}. ${question.question_text}`}
          required={true}
          options={question.answers.map((answer) => ({
            label: answer.answer_text,
            value: answer.id,
          }))}
        />
      ))}
      {result?.error && <div className="FormFieldError">{result.error}</div>}
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      {!isFirst && (
        <button type="button" onClick={goBack}>
          Back
        </button>
      )}
      {!isLast && (
        <button type="button" onClick={goNext}>
          Next
        </button>
      )}
      {isLast && (
        <button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </button>
      )}
    </div>
  );

  return (
    <Form form={form} onSubmit={submit}>
      <InfoMessage type={InfoMessageType.Info}>
        The results of this questionnaire will aggregate a hidden score that
        contributes to the average rating.
      </InfoMessage>

      <div>
        {header}
        {content}
        {footer}
      </div>
    </Form>
  );
};

export { RatingForm };
