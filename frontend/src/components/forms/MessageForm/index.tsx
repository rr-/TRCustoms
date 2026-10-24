import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { hasPermission } from "src/components/common/PermissionGuard";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { buildMessageTextSchema } from "src/components/forms/MessageForm/schema";
import { CheckboxField } from "src/components/forms/fields/CheckboxField";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { getMarkdownLimit } from "src/services/MarkdownLimitService";
import { MessageService } from "src/services/MessageService";
import type { MessageQuota } from "src/services/MessageService";
import type { ThreadDetails } from "src/services/MessageService";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { useConfig } from "src/stores/config";
import { useUser } from "src/stores/user";
import { resetQueries } from "src/utils/misc";
import { z } from "zod";

const buildSchema = (maxLength: number | null) =>
  z.object({
    text: buildMessageTextSchema(maxLength),
    sendAsAdministrator: z.boolean(),
  });
type MessageFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface MessageFormProps {
  receiver: UserDetails;
  onGoBack?: (() => void) | undefined;
  onSubmit?: ((thread: ThreadDetails) => void) | undefined;
}

const MessageForm = ({ receiver, onGoBack, onSubmit }: MessageFormProps) => {
  const { user } = useUser();
  const { config } = useConfig();
  const maxLength = getMarkdownLimit(config, "message_text");
  const queryClient = useQueryClient();
  const canSendAsAdministrator = hasPermission(
    user,
    UserPermission.messageAsAdministrator,
  );
  const mustSendAsAdministrator = !receiver.can_message;

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(buildSchema(maxLength)),
    defaultValues: {
      text: "",
      sendAsAdministrator: mustSendAsAdministrator,
    },
  });
  const sendAsAdministrator = useWatch({
    control: form.control,
    name: "sendAsAdministrator",
  });

  const quotaResult = useQuery<MessageQuota, Error>({
    queryKey: queryKeys.messages.quota(),
    queryFn: MessageService.getQuota,
  });

  const { submit, result } = useFormSubmit(form, async (values) => {
    const thread = await MessageService.send({
      receiverId: receiver.id,
      text: values.text,
      sendAsAdministrator: values.sendAsAdministrator,
    });
    await resetQueries(queryClient, [queryKeys.messages.all], true);
    onSubmit?.(thread);
  });

  const quota = quotaResult.data;

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid gridType={FormGridType.Column}>
        <FormGridFieldSet
          footer={
            !sendAsAdministrator && quota
              ? `New conversations today: ${quota.remaining}/${quota.limit} remaining`
              : undefined
          }
        >
          <InfoMessage type={InfoMessageType.Info}>
            Messages are not private and are monitored by mods for abuse.
          </InfoMessage>

          <TextAreaField
            rich={true}
            allowColors={false}
            required={true}
            label="Message"
            name="text"
            markdownLimitKey="message_text"
          />

          {canSendAsAdministrator && (
            <CheckboxField
              readonly={mustSendAsAdministrator}
              label='Send as "Administration"'
              name="sendAsAdministrator"
            />
          )}
        </FormGridFieldSet>

        <FormButtons result={result}>
          <button type="submit" disabled={form.formState.isSubmitting}>
            Send
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

export { MessageForm };
