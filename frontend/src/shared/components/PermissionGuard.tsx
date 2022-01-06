import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import type { UserLite } from "src/services/user.service";
import { UserContext } from "src/shared/contexts/UserContext";

interface PermissionGuardProps {
  require: string;
  owningUsers?: UserLite[];
  children: React.ReactElement;
  alternative?: React.ReactElement | string | null;
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
      (owningUsers && owningUsers.map((u) => u.id).includes(user.id));

    setIsShown(newIsShown);
  }, [user, owningUsers, require]);

  if (isShown) {
    return children;
  }
  return <>{alternative}</>;
};

export { PermissionGuard };
