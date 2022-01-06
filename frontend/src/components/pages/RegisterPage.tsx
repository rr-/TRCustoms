import { useState } from "react";
import { useCallback } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import type { User } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import UserForm from "src/shared/components/UserForm";
import { UserContext } from "src/shared/contexts/UserContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const onSubmit = useCallback(
    async (user: User, password: string | null) => {
      if (user.is_active) {
        await AuthService.login(user.username, password);
        setUser(await UserService.getCurrentUser());
        navigate("/");
      } else {
        setIsComplete(true);
      }
    },
    [setIsComplete, navigate, setUser]
  );

  return (
    <div className="RegisterForm">
      <h1>Register</h1>

      {isComplete ? (
        <>
          Your account was created and it now needs to be activated by our
          staff. Please have patience :) In the meantime, why don't you take a
          look at <Link to={"/"}>some levels</Link>?
        </>
      ) : (
        <UserForm onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default RegisterPage;
