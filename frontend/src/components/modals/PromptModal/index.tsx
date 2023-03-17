import styles from "./index.module.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useRef } from "react";
import { useEffect } from "react";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextAreaFormField } from "src/components/formfields/TextAreaFormField";
import { TextFormField } from "src/components/formfields/TextFormField";
import { BaseModal } from "src/components/modals/BaseModal";

interface PromptModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  onConfirm: (text: string) => void;
  label?: string | undefined;
  children: React.ReactNode;
  big?: boolean | undefined;
}

const PromptModal = ({
  isActive,
  onIsActiveChange,
  onConfirm,
  label,
  children,
  big,
}: PromptModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const initialValues = { text: "" };

  const handleSubmit = (values: any) => {
    if (values.text) {
      onIsActiveChange?.(false);
      onConfirm?.(values.text);
    }
  };

  // focus the input when opening the modal.
  useEffect(() => {
    // absolute garbage but I'm too burnt out to play around.
    window.setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.querySelector("input")?.focus();
      }
    }, 100);
  }, [isActive]);

  const PromptModalBody = () => {
    return (
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ submitForm }) => (
          <Form className={big ? styles.formBig : styles.formSmall}>
            {big ? (
              <TextAreaFormField label={label} name="text" rich={false} />
            ) : (
              <TextFormField label={label} name="text" />
            )}

            <SubmitButton onClick={() => submitForm()}>Confirm</SubmitButton>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <BaseModal
      title="Confirmation"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
      ref={modalRef}
      buttons={<PromptModalBody />}
    >
      {children}
    </BaseModal>
  );
};

export { PromptModal };
