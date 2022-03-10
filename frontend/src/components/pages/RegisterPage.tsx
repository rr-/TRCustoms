import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserForm } from "src/components/UserForm";
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

      {isComplete ? (
        <>
          An email was sent to your email address. To continue, please check
          your mailbox and click the confirmation link inside.
        </>
      ) : (
        <UserForm onSubmit={handleSubmit} />
      )}
    </div>
  );
};

export { RegisterPage };
