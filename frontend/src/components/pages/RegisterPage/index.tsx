import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { InfoMessage } from "src/components/common/InfoMessage";
import { UserForm } from "src/components/common/UserForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (user: UserDetails, password: string | null) => {
      if (user.is_active && password) {
        await AuthService.login(user.username, password);
        setUser(await UserService.getCurrentUser());
        navigate("/");
      } else {
        setIsComplete(true);
      }
    },
    [setIsComplete, navigate, setUser],
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Register",
      description:
        "Sign up as a user on our website to be able to upload levels, post reviews, and more!",
    }),
    [],
  );

  return (
    <PlainLayout header="Register">
      <InfoMessage type={InfoMessageType.Info}>
        <span>
          If you already have a user profile on trle.net, you can claim it by
          registering with the same username.
          <br /> This also allows you to freely edit your previous submissions.
        </span>
      </InfoMessage>
      {isComplete ? (
        <>
          An email was sent to your mailbox with a confirmation link. Without
          confirmation, your registration will be cancelled after 6 hours.
          <br />
          If you cannot find the email in your Inbox, please check your
          Spam/Junk folder.
        </>
      ) : (
        <UserForm onSubmit={handleSubmit} />
      )}
    </PlainLayout>
  );
};

export { RegisterPage };
