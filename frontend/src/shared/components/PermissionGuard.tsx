import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import type { User } from "src/services/user.service";
import { UserContext } from "src/shared/contexts/UserContext";

interface PermissionGuardProps {
  require: string;
  owningUser?: User;
  children: React.ReactElement;
  alternative?: React.ReactElement | string | null;
}

const PermissionGuard = ({
  require,
  owningUser,
  children,
  alternative,
}: PermissionGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    let newIsShown =
      user?.permissions?.includes(require) ||
      (owningUser && user?.id === owningUser?.id);

    setIsShown(newIsShown);
  }, [user, owningUser, require]);

  if (isShown) {
    return children;
  }
  return <>{alternative}</>;
};

export { PermissionGuard };
