import { useNavigate } from "react-router-dom";
import { LoginForm } from "src/components/forms/LoginForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const LoginPage = () => {
  const navigate = useNavigate();
  usePageMetadata(() => ({ ready: true, title: "Login" }), []);
  return (
    <PlainLayout header="Login">
      <LoginForm onLogin={() => navigate("/")} />
    </PlainLayout>
  );
};

export { LoginPage };
