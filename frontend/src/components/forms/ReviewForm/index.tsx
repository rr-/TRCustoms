import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { LevelLink } from "src/components/links/LevelLink";
import type { LevelNested } from "src/services/LevelService";
import type { ReviewDetails } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import { queryKeys } from "src/services/queryKeys";
import { resetQueries } from "src/utils/misc";
import { z } from "zod";

interface ReviewFormProps {
  level: LevelNested;
  review?: ReviewDetails | null | undefined;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((review: ReviewDetails) => void) | undefined;
}

const schema = z.object({
  text: z.string().min(1, "Review text is required"),
});
type ReviewFormValues = z.infer<typeof schema>;

const ReviewForm = ({ level, review, onGoBack, onSubmit }: ReviewFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: review?.text || "" },
  });

  // Refill the form when a different review loads.
  const { reset } = form;
  useEffect(() => {
    reset({ text: review?.text || "" });
  }, [review?.id, review?.text, reset]);

  const { submit, result } = useFormSubmit(form, async (values) => {
    const payload = { levelId: level.id, text: values.text };
    if (review?.id) {
      const outReview = await ReviewService.update(review.id, payload);
      resetQueries(
        queryClient,
        [queryKeys.levels.all, queryKeys.reviews.all],
        true,
      );
      resetQueries(queryClient, [queryKeys.auditLogs.all]);
      onSubmit?.(outReview);
      return {
        final: true,
        success: (
          <>
            Review updated.{" "}
            <LevelLink subPage="reviews" level={level}>
              Click here
            </LevelLink>{" "}
            to see the changes.
          </>
        ),
      };
    }
    const outReview = await ReviewService.create(payload);
    resetQueries(queryClient, [
      queryKeys.levels.all,
      queryKeys.reviews.all,
      queryKeys.auditLogs.all,
    ]);
    onSubmit?.(outReview);
    return {
      final: true,
      success: (
        <>
          Review posted.{" "}
          <LevelLink subPage="reviews" level={level}>
            Click here
          </LevelLink>{" "}
          to go back to the level page.
        </>
      ),
    };
  });

  if (result?.final && result.success) {
    return <div className="FormFieldSuccess">{result.success}</div>;
  }

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid gridType={FormGridType.Column}>
        <FormGridFieldSet>
          <InfoMessage type={InfoMessageType.Info}>
            Remember to stay respectful and constructive, and avoid excessive
            profanity.
            <br />
            The review needs to be written in English.
          </InfoMessage>

          <TextAreaField
            rich={true}
            required={true}
            allowColors={false}
            label="Review text"
            markdownLimitKey="review_text"
            name="text"
          />
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            {review ? "Update review" : "Submit review"}
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

export { ReviewForm };
