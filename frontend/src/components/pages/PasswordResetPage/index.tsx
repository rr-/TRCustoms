import { PasswordResetForm } from "src/components/forms/PasswordResetForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/stores/pageMetadata";

const PasswordResetPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Password Reset",
      description: "Forgot your password? Reset it here!",
    }),
    [],
  );
  return (
    <PlainLayout header="Password Reset">
      <PasswordResetForm />
    </PlainLayout>
  );
};

export { PasswordResetPage };
