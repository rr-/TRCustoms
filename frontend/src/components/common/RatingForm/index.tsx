import styles from "./index.module.css";
import { AxiosError } from "axios";
import axios from "axios";
import { groupBy } from "lodash";
import { last } from "lodash";
import { useLayoutEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { RatingFormValues } from "src/components/common/RatingForm/RatingFormPage";
import { RatingFormPage } from "src/components/common/RatingForm/RatingFormPage";
import { ErrorMessage } from "src/components/forms/ErrorMessage";
import { SuccessMessage } from "src/components/forms/SuccessMessage";
import { LevelLink } from "src/components/links/LevelLink";
import type { RatingTemplateQuestion } from "src/services/ConfigService";
import type { Config } from "src/services/ConfigService";
import type { LevelNested } from "src/services/LevelService";
import type { RatingDetails } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import { extractNestedErrorText } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { titleCase } from "src/utils/string";
import { makeSentence } from "src/utils/string";

interface RatingFormProps {
  config: Config;
  level: LevelNested;
  rating?: RatingDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((rating: RatingDetails) => void) | undefined;
}

const mapQuestionsToAnswers = (
  templateQuestions: RatingTemplateQuestion[],
  userAnswerIds: number[]
): RatingFormValues => {
  const questionToAnswer: RatingFormValues = {};

  templateQuestions.forEach((question) => {
    question.answers.forEach((answer) => {
      if (userAnswerIds.includes(answer.id)) {
        questionToAnswer[question.id] = answer.id;
      }
    });
  });

  return questionToAnswer;
};

const RatingForm = ({
  config,
  level,
  rating,
  onGoBack,
  onSubmit,
}: RatingFormProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<{
    error?: React.ReactElement;
    success?: React.ReactElement;
  }>({});
  const [navigationDirection, setNavigationDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  let [activeTabName, setActiveTabName] = useState<string>();
  const [formValues, setFormValues] = useState<RatingFormValues>(
    rating ? mapQuestionsToAnswers(config.rating_questions, rating.answers) : {}
  );

  const handleSubmitError = (error: any) => {
    setIsSubmitting(false);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data;
      if (data.detail) {
        setStatus({ error: <>{makeSentence(data.detail)}</> });
      }
      const errors = extractNestedErrorText(data?.answer_ids);
      if (errors.filter(Boolean).length) {
        setStatus({ error: <>{errors.join(" ")}</> });
      } else {
        console.error(error);
        setStatus({ error: <>Unknown error.</> });
      }
    } else {
      console.error(error);
      setStatus({ error: <>Unknown error.</> });
    }
  };

  const submit = async (data: RatingFormValues) => {
    setIsSubmitting(true);
    setStatus({});
    try {
      const payload = {
        levelId: level.id,
        answerIds: Object.values(data) as number[],
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
      handleSubmitError(error);
    }
  };

  const handlePageSubmit = (data: RatingFormValues) => {
    setFormValues({ ...formValues, ...data });
    if (navigationDirection === -1) {
      if (activeTabName === categories?.[0]) {
        return;
      }
      setActiveTabName(
        categories[categories?.indexOf(activeTabName || "") - 1]
      );
    } else if (navigationDirection === +1) {
      if (activeTabName === last(categories)) {
        submit(data);
      } else {
        setActiveTabName(
          categories[categories?.indexOf(activeTabName || "") + 1]
        );
      }
    }
  };

  useLayoutEffect(() => {
    if (navigationDirection !== 0) {
      wrapperRef?.current?.querySelector("form")?.requestSubmit();
      // Reset the navigation direction
      setNavigationDirection(0);
    }
  }, [navigationDirection]);

  const handleBackClick = () => {
    setNavigationDirection(-1);
  };

  const handleNextClick = () => {
    setNavigationDirection(+1);
  };

  if (status.success) {
    return <SuccessMessage>{status.success}</SuccessMessage>;
  }

  const questionGroups = groupBy(
    config.rating_questions,
    (question) => question.category
  );
  const categories = Object.keys(questionGroups);

  const tabs = Object.entries(questionGroups).map(
    ([category, groupedQuestions]) => ({
      name: category,
      label: titleCase(category),
      content: (
        <RatingFormPage
          category={category}
          questions={groupedQuestions}
          formValues={formValues}
          onSubmit={handlePageSubmit}
        />
      ),
    })
  );

  activeTabName ??= tabs[0]?.name;

  const header = (
    <header className={styles.header}>
      <ul className={styles.nav}>
        {tabs.map((tab) => (
          <li
            key={tab.name}
            className={`${styles.navItem} ${
              tab.name === activeTabName ? styles.active : ""
            } ${
              categories.indexOf(tab.name) <
              categories.indexOf(activeTabName || "")
                ? styles.complete
                : ""
            }`}
          >
            <span className={styles.step}>
              <span className={styles.line}></span>
              <span className={styles.circle}></span>
            </span>
            <span className={styles.navItemLink}>{tab.label}</span>
          </li>
        ))}
      </ul>
    </header>
  );

  /* Note: rendering it in the same position makes React remember the form
   * state and is essential for the wizard to work. */
  const activeTab = (
    <div key={activeTabName} className={styles.content}>
      {tabs.filter((tab) => tab.name === activeTabName)[0]?.content ?? null}
      <ErrorMessage>{status.error}</ErrorMessage>
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      {activeTabName !== categories?.[0] && (
        <button onClick={handleBackClick}>Back</button>
      )}
      {activeTabName !== last(categories) && (
        <button onClick={handleNextClick}>Next</button>
      )}
      {activeTabName === last(categories) && (
        <button onClick={handleNextClick} disabled={isSubmitting}>
          Submit
        </button>
      )}
    </div>
  );

  return (
    <>
      <InfoMessage type={InfoMessageType.Info}>
        The results of this questionnaire will aggregate a hidden score that
        contributes to the average rating.
      </InfoMessage>

      <div ref={wrapperRef}>
        {header}
        {activeTab}
        {footer}
      </div>
    </>
  );
};

export { RatingForm };
