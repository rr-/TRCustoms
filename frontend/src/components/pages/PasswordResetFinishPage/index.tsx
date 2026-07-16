import { useParams } from "react-router-dom";
import { PasswordResetFinishForm } from "src/components/forms/PasswordResetFinishForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const PasswordResetFinishPage = () => {
  const { token = "" } = useParams();
  usePageMetadata(() => ({ ready: true, title: "Password Reset" }), []);
  return (
    <PlainLayout header="Password Reset Finish">
      <PasswordResetFinishForm token={token} />
    </PlainLayout>
  );
};

export { PasswordResetFinishPage };
