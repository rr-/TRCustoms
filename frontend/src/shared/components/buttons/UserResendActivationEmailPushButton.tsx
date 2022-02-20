import { useState } from "react";
import { AuthService } from "src/services/auth.service";
import { UserService } from "src/services/user.service";
import { PushButton } from "src/shared/components/PushButton";

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
