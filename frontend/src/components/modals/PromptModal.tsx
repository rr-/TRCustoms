import "./Modal.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useRef } from "react";
import { useEffect } from "react";
import { PushButton } from "src/components/PushButton";
import { SearchBar } from "src/components/SearchBar";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconX } from "src/components/icons";
import { Dim } from "src/components/modals/Dim";

interface PromptModalProps {
  isActive: boolean;
  onIsActiveChange?: ((isActive: boolean) => void) | undefined;
  onConfirm?: ((text: string) => void) | undefined;
  label?: string | undefined;
  children?: React.ReactNode | undefined;
}

const PromptModal = ({
  isActive,
  onIsActiveChange,
  onConfirm,
  label,
  children,
}: PromptModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const initialValues = { text: "" };

  const handleDimClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      event.stopPropagation();
      event.preventDefault();
      onIsActiveChange?.(false);
    }
  };

  const handleCloseClick = () => {
    onIsActiveChange?.(false);
  };

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

  return (
    <Dim isActive={isActive} onMouseDown={handleDimClick}>
      <div className="Modal" ref={modalRef}>
        <div className="Modal--body">
          <PushButton
            className="Modal--closeButton"
            isPlain={true}
            disableTimeout={true}
            onClick={handleCloseClick}
          >
            <IconX />
          </PushButton>

          {children}

          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ submitForm }) => (
              <Form className="Modal--form">
                <SearchBar>
                  <TextFormField label={label} name="text" />

                  <div className="FormField">
                    <SubmitButton onClick={() => submitForm()}>
                      Confirm
                    </SubmitButton>
                  </div>
                </SearchBar>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Dim>
  );
};

export { PromptModal };
