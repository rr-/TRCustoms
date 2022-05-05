import { Formik } from "formik";
import { Form } from "formik";
import { useCallback } from "react";
import { FormGrid } from "src/components/FormGrid";
import { FormGridButtons } from "src/components/FormGrid";
import { FormGridFieldSet } from "src/components/FormGrid";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import type { LevelNested } from "src/services/LevelService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import { extractErrorMessage } from "src/utils/misc";

interface WalkthroughFormProps {
  level?: LevelNested | undefined;
  walkthrough?: WalkthroughDetails | undefined;
}

const WalkthroughForm = ({ level, walkthrough }: WalkthroughFormProps) => {
  const initialValues = {
    text:
      walkthrough?.text ||
      `# Level Walkthrough
## Level 1
Example text.

## Level 2
Example text.`,
  };

  const handleSubmitError = useCallback(
    (error, { setSubmitting, setStatus }) => {
      console.error(error);
      const message = extractErrorMessage(error);
      setSubmitting(false);
      setStatus({ error: message });
    },
    []
  );

  const handleSubmit = useCallback(
    async (values, { setSubmitting, setStatus, setErrors }) => {
      setStatus({});
      try {
        if (walkthrough?.id) {
          const outWalkthrough = await WalkthroughService.update(
            walkthrough.id,
            { text: values.text }
          );
          setStatus({
            final: false,
            success: (
              <>
                Walkthrough updated.{" "}
                <WalkthroughLink
                  walkthrough={{
                    id: outWalkthrough.id,
                    levelName: outWalkthrough.level.name,
                  }}
                >
                  Click here
                </WalkthroughLink>{" "}
                to see the changes.
              </>
            ),
          });
        } else if (level) {
          const outWalkthrough = await WalkthroughService.create({
            levelId: level?.id,
            walkthroughType: WalkthroughType.Text,
            text: values.text,
          });
          setStatus({
            final: true,
            success: (
              <>
                Walkthrough draft saved.{" "}
                <WalkthroughLink
                  walkthrough={{
                    id: outWalkthrough.id,
                    levelName: outWalkthrough.level.name,
                  }}
                >
                  Click here
                </WalkthroughLink>{" "}
                to see it.
              </>
            ),
          });
        }
      } catch (error) {
        handleSubmitError(error, { setSubmitting, setStatus, setErrors });
      }
    },
    [level, walkthrough, handleSubmitError]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, status, ...context }) =>
        status?.final && status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form className="Form">
            <FormGrid>
              <FormGridFieldSet>
                <TextAreaFormField label="Text" name="text" />
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {walkthrough?.status === WalkthroughStatus.Draft
                    ? "Update draft"
                    : walkthrough
                    ? "Update walkthrough"
                    : "Save draft"}
                </button>
              </FormGridButtons>
            </FormGrid>
          </Form>
        )
      }
    </Formik>
  );
};

export { WalkthroughForm };
