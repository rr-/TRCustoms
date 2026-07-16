import { useParams } from "react-router-dom";
import { PasswordResetFinishForm } from "src/components/forms/PasswordResetFinishForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

interface PasswordResetFinishPageParams {
  token: string;
}

const PasswordResetFinishPage = () => {
  const { token } = useParams() as unknown as PasswordResetFinishPageParams;
  usePageMetadata(() => ({ ready: true, title: "Password Reset" }), []);
  return (
    <PlainLayout header="Password Reset Finish">
      <PasswordResetFinishForm token={token} />
    </PlainLayout>
  );
};

export { PasswordResetFinishPage };
