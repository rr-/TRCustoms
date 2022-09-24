import { useState } from "react";
import { PushButton } from "src/components/PushButton";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";

interface UserResendActivationEmailPushButtonProps {
  username: string;
}

const UserResendActivationEmailPushButton = ({
  username,
}: UserResendActivationEmailPushButtonProps) => {
  const [isResent, setIsResent] = useState(false);

  const handleButtonClick = async () => {
    AuthService.logout();
    UserService.resendActivationLink(username);
    setIsResent(true);
  };

  return (
    <PushButton
      isPlain={true}
      disabled={isResent}
      disableTimeout={true}
      onClick={handleButtonClick}
    >
      Resend activation email
    </PushButton>
  );
};

export { UserResendActivationEmailPushButton };
