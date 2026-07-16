import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { TextAreaField } from "src/components/forms/TextAreaField";
import { TextField } from "src/components/forms/TextField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { NewsLink } from "src/components/links/NewsLink";
import type { NewsDetails } from "src/services/NewsService";
import { NewsService } from "src/services/NewsService";
import { resetQueries } from "src/utils/misc";
import { z } from "zod";

interface NewsFormProps {
  news?: NewsDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((news: NewsDetails) => void) | undefined;
}

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  text: z.string().min(1, "News text is required"),
});
type NewsFormValues = z.infer<typeof schema>;

const NewsForm = ({ news, onGoBack, onSubmit }: NewsFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: news?.subject || "", text: news?.text || "" },
  });

  // Refill the form when a different news item loads. Keyed on the id so it
  // does not clobber the user's edits.
  const { reset } = form;
  useEffect(() => {
    reset({ subject: news?.subject || "", text: news?.text || "" });
  }, [news?.id, news?.subject, news?.text, reset]);

  const { submit, result } = useFormSubmit(form, async (values) => {
    const outNews = news?.id
      ? await NewsService.update(news.id, values)
      : await NewsService.create(values);
    resetQueries(queryClient, ["newsList"]);
    onSubmit?.(outNews);
    return {
      final: true,
      success: (
        <>
          News {news?.id ? "updated" : "posted"}.{" "}
          <NewsLink news={outNews}>Click here</NewsLink> to see the changes.
        </>
      ),
    };
  });

  if (result?.final && result.success) {
    return <div className="FormFieldSuccess">{result.success}</div>;
  }

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid gridType={FormGridType.Grid}>
        <FormGridFieldSet>
          <TextField required={true} label="Subject" name="subject" />

          <TextAreaField
            rich={true}
            required={true}
            label="News text"
            markdownLimitKey="news_text"
            name="text"
          />
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            {news ? "Update news" : "Submit news"}
          </button>
          {onGoBack && (
            <button type="button" onClick={onGoBack}>
              Go back
            </button>
          )}
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { NewsForm };
