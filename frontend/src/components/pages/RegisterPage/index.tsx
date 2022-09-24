import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { InfoMessage } from "src/components/common/InfoMessage";
import { UserForm } from "src/components/common/UserForm";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { setTitle } = useContext(TitleContext);
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
    [setIsComplete, navigate, setUser]
  );

  useEffect(() => {
    setTitle("Register");
  }, [setTitle]);

  return (
    <div className="RegisterForm">
      <h1>Register</h1>

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
    </div>
  );
};

export { RegisterPage };
