import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { buildMessageTextSchema } from "src/components/forms/MessageForm/schema";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { getMarkdownLimit } from "src/services/MarkdownLimitService";
import { MessageService } from "src/services/MessageService";
import type { ThreadDetails } from "src/services/MessageService";
import { queryKeys } from "src/services/queryKeys";
import { useConfig } from "src/stores/config";
import { resetQueries } from "src/utils/misc";
import { z } from "zod";

interface MessageReplyFormProps {
  thread: ThreadDetails;
  onCancel?: (() => void) | undefined;
  onSubmit?: (() => void) | undefined;
}

const MessageReplyForm = ({
  thread,
  onCancel,
  onSubmit,
}: MessageReplyFormProps) => {
  const queryClient = useQueryClient();
  const { config } = useConfig();
  const schema = z.object({
    text: buildMessageTextSchema(getMarkdownLimit(config, "message_text")),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { text: "" },
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    await MessageService.reply(thread.id, values.text);
    form.reset({ text: "" });
    await resetQueries(queryClient, [queryKeys.messages.all], true);
    onSubmit?.();
  });

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid gridType={FormGridType.Column}>
        <FormGridFieldSet>
          <TextAreaField
            rich={true}
            allowColors={false}
            required={true}
            label={`Reply to ${thread.other_user?.username ?? "a deleted user"}${
              thread.replies_as_administrator ? ' as "Administration"' : ""
            }`}
            name="text"
            markdownLimitKey="message_text"
          />
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            Send reply
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { MessageReplyForm };
