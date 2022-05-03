import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { FormGrid } from "src/components/FormGrid";
import { FormGridButtons } from "src/components/FormGrid";
import { FormGridFieldSet } from "src/components/FormGrid";
import { PushButton } from "src/components/PushButton";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { WalkthroughLink } from "src/components/links/WalkthroughLink";
import { BaseModal } from "src/components/modals/BaseModal";
import type { LevelNested } from "src/services/LevelService";
import { StorageService } from "src/services/StorageService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";
import { WalkthroughService } from "src/services/WalkthroughService";
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

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState<string | undefined>();

  const handleSaveDraftButtonClick = (context: any) => {
    StorageService.setItem("walkthroughDraft", context.values.text);
    setAlertText("Draft saved.");
    setIsAlertVisible(true);
  };

  const handleRestoreDraftButtonClick = (context: any) => {
    context.setFieldValue("text", StorageService.getItem("walkthroughDraft"));
    setAlertText("Draft restored.");
    setIsAlertVisible(true);
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
            success: (
              <>
                <WalkthroughLink
                  walkthrough={{
                    id: outWalkthrough.id,
                    levelName: outWalkthrough.level.name,
                  }}
                >
                  Your walkthrough
                </WalkthroughLink>{" "}
                was uploaded and it now needs to be approved by the staff.
                Please have patience :) In the meantime, why don't you take a
                look at <Link to={"/"}>some levels</Link>?
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
        !walkthrough && status?.success ? (
          <div className="FormFieldSuccess">{status.success}</div>
        ) : (
          <Form className="Form">
            <BaseModal
              title="Alert"
              isActive={isAlertVisible}
              onIsActiveChange={setIsAlertVisible}
            >
              {alertText}
            </BaseModal>

            <FormGrid>
              <FormGridFieldSet>
                <TextAreaFormField label="Text" name="text" />
              </FormGridFieldSet>

              <FormGridButtons status={status}>
                <button type="submit" disabled={isSubmitting}>
                  {walkthrough ? "Update walkthrough" : "Submit for approval"}
                </button>

                <PushButton onClick={() => handleSaveDraftButtonClick(context)}>
                  Save draft
                </PushButton>

                <PushButton
                  onClick={() => handleRestoreDraftButtonClick(context)}
                >
                  Restore draft
                </PushButton>
              </FormGridButtons>
            </FormGrid>
          </Form>
        )
      }
    </Formik>
  );
};

export { WalkthroughForm };
