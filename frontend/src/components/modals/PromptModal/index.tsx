import styles from "./index.module.css";
import { useEffect } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { Form } from "src/components/forms/Form";
import { TextAreaField } from "src/components/forms/TextAreaField";
import { TextField } from "src/components/forms/TextField";
import { BaseModal } from "src/components/modals/BaseModal";

interface PromptModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  onConfirm: (text: string) => void;
  label?: string | undefined;
  children: React.ReactNode;
  big?: boolean | undefined;
}

interface PromptModalValues {
  text: string;
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
    const form = useForm<PromptModalValues>({ defaultValues: { text: "" } });
    const submit = form.handleSubmit((values) => {
      if (values.text) {
        onIsActiveChange?.(false);
        onConfirm?.(values.text);
      }
    });

    return (
      <Form
        form={form}
        onSubmit={submit}
        className={big ? styles.formBig : styles.formSmall}
      >
        {big ? (
          <TextAreaField label={label} name="text" rich={false} />
        ) : (
          <TextField label={label} name="text" />
        )}

        <SubmitButton>Confirm</SubmitButton>
      </Form>
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
