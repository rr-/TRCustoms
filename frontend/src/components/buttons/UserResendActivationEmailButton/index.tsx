import { useState } from "react";
import { Link } from "src/components/common/Link";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";

interface UserResendActivationEmailButtonProps {
  username: string;
}

const UserResendActivationEmailButton = ({
  username,
}: UserResendActivationEmailButtonProps) => {
  const [isResent, setIsResent] = useState(false);

  const handleButtonClick = async () => {
    AuthService.logout();
    UserService.resendActivationLink(username);
    setIsResent(true);
  };

  return (
    <Link disabled={isResent} onClick={handleButtonClick}>
      Resend activation email
    </Link>
  );
};

export { UserResendActivationEmailButton };
