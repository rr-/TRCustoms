import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { TextAreaField } from "src/components/forms/fields/TextAreaField";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import type { LevelNested } from "src/services/LevelService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import type { WalkthroughListing } from "src/services/WalkthroughService";
import { z } from "zod";

const DEFAULT_TEXT = `# Level Walkthrough
## Level 1
Example text.

## Level 2
Example text.`;

const schema = z.object({
  text: z.string().min(1, "Walkthrough text is required"),
});
type WalkthroughFormValues = z.infer<typeof schema>;

const successMessage = (
  walkthrough: WalkthroughListing,
  action: string,
  suffix: string,
) => (
  <>
    Walkthrough {action}.{" "}
    <WalkthroughLink
      walkthrough={{ id: walkthrough.id, levelName: walkthrough.level.name }}
    >
      Click here
    </WalkthroughLink>{" "}
    {suffix}.
  </>
);

interface WalkthroughDraftDisclaimerProps {
  walkthrough?: WalkthroughDetails | undefined;
}

const WalkthroughDraftDisclaimer = ({
  walkthrough,
}: WalkthroughDraftDisclaimerProps) => {
  if (walkthrough?.status !== WalkthroughStatus.Draft) {
    return null;
  }
  return (
    <InfoMessage type={InfoMessageType.Info}>
      <span>
        Keep backups saved on your machine as <strong>drafts</strong> will be
        deleted after 1 week if not updated/submitted.
        <br />
        Users cannot see your walkthrough until your draft is submitted and
        approved.
      </span>
    </InfoMessage>
  );
};

interface WalkthroughFormProps {
  level?: LevelNested | undefined;
  walkthrough?: WalkthroughDetails | undefined;
}

const WalkthroughForm = ({ level, walkthrough }: WalkthroughFormProps) => {
  const form = useForm<WalkthroughFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: walkthrough?.text || DEFAULT_TEXT },
  });

  const { submit, result } = useFormSubmit(form, async ({ text }) => {
    if (walkthrough?.id) {
      const updated = await WalkthroughService.update(walkthrough.id, { text });
      return {
        final: false,
        success: successMessage(updated, "updated", "to see the changes"),
      };
    }
    if (level) {
      const created = await WalkthroughService.create({
        levelId: level.id,
        walkthroughType: WalkthroughType.Text,
        text,
      });
      return {
        final: true,
        success: successMessage(created, "draft saved", "to see it"),
      };
    }
  });

  if (result?.final && result.success) {
    return <div className="FormFieldSuccess">{result.success}</div>;
  }

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid>
        <FormGridFieldSet>
          <TextAreaField
            label="Text"
            name="text"
            rich={true}
            markdownLimitKey="walkthrough_text"
          />
        </FormGridFieldSet>

        <FormButtons
          result={result}
          extra={<WalkthroughDraftDisclaimer walkthrough={walkthrough} />}
        >
          <button type="submit" disabled={form.formState.isSubmitting}>
            {walkthrough?.status === WalkthroughStatus.Draft
              ? "Update draft"
              : walkthrough
                ? "Update walkthrough"
                : "Save draft"}
          </button>
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { WalkthroughForm };
