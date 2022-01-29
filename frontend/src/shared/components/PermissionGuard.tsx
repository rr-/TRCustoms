import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import type { UserNested } from "src/services/user.service";
import { UserContext } from "src/shared/contexts/UserContext";

interface PermissionGuardProps {
  require: string;
  owningUsers?: UserNested[] | undefined;
  children: React.ReactElement;
  alternative?: React.ReactNode | undefined;
}

const PermissionGuard = ({
  require,
  owningUsers,
  children,
  alternative,
}: PermissionGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    let newIsShown =
      user?.permissions?.includes(require) ||
      (owningUsers && owningUsers.map((u) => u.id).includes(user?.id));

    setIsShown(newIsShown);
  }, [user, owningUsers, require]);

  if (isShown) {
    return children;
  }
  return <>{alternative}</>;
};

export { PermissionGuard };
