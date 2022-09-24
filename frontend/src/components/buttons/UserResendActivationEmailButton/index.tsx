import { useState } from "react";
import { Button } from "src/components/common/Button";
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
    <Button
      isPlain={true}
      disabled={isResent}
      disableTimeout={true}
      onClick={handleButtonClick}
    >
      Resend activation email
    </Button>
  );
};

export { UserResendActivationEmailButton };
