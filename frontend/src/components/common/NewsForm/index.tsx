import { AxiosError } from "axios";
import axios from "axios";
import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { Loader } from "src/components/common/Loader";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { NewsLink } from "src/components/links/NewsLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
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
  const { config } = useContext(ConfigContext);
  const queryClient = useQueryClient();
  const initialValues = {
    subject: news?.subject || "",
    text: news?.text || "",
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
                News updated. <NewsLink news={outNews}>Click here</NewsLink> to
                see the changes.
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
                News posted. <NewsLink news={outNews}>Click here</NewsLink> to
                see the changes.
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
                <TextFormField required={true} label="Subject" name="subject" />

                <TextAreaFormField
                  validate={validateRequired}
                  rich={true}
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
