import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { FormGrid } from "src/components/FormGrid";
import { FormGridFieldSet } from "src/components/FormGrid";
import { FormGridType } from "src/components/FormGrid";
import { FormGridButtons } from "src/components/FormGrid";
import { Loader } from "src/components/Loader";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { UsersFormField } from "src/components/formfields/UsersFormField";
import { ConfigContext } from "src/contexts/ConfigContext";
import { UserContext } from "src/contexts/UserContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import type { UserNested } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";
import { makeSentence } from "src/utils/string";
import { validateRequired } from "src/utils/validation";

interface NewsFormProps {
  news?: NewsDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((news: NewsDetails) => void) | undefined;
}

const NewsForm = ({ news, onGoBack, onSubmit }: NewsFormProps) => {
  const { user } = useContext(UserContext);
  const { config } = useContext(ConfigContext);
  const queryClient = useQueryClient();
  const initialValues = {
    subject: news?.subject || "",
    text: news?.text || "",
    authors: news ? [...news.authors] : user ? [user] : [],
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
          authors: data?.author_ids,
          subject: data?.subject,
          text: data?.text,
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
      setStatus({});
      try {
        const payload = {
          authorIds: values.authors.map((author: UserNested) => author.id),
          subject: values.subject,
          text: values.text,
        };

        if (news?.id) {
          let outNews = await NewsService.update(news.id, payload);
          resetQueries(queryClient, ["newsList"]);
          onSubmit?.(outNews);

          setStatus({
            success: (
              <>
                News updated. <Link to="/">Click here</Link> to see the changes.
              </>
            ),
          });
        } else {
          let outNews = await NewsService.create(payload);
          resetQueries(queryClient, ["newsList"]);
          onSubmit?.(outNews);

          setStatus({
            success: (
              <>
                News posted. <Link to="/">Click here</Link> to go back to the
                home page.
              </>
            ),
          });
        }
      } catch (error) {
        handleSubmitError(error, { setSubmitting, setStatus, setErrors });
      }
    },
    [news, onSubmit, handleSubmitError, queryClient]
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
            <FormGrid gridType={FormGridType.Grid}>
              <FormGridFieldSet>
                <UsersFormField
                  required={config.limits.min_authors > 0}
                  label="Authors"
                  name="authors"
                  value={values.authors}
                  onChange={(value) => setFieldValue("authors", value)}
                />

                <TextFormField required={true} label="Subject" name="subject" />

                <TextAreaFormField
                  validate={validateRequired}
                  required={true}
                  label="News text"
                  name="text"
                />
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {news ? "Update news" : "Submit news"}
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

export { NewsForm };
