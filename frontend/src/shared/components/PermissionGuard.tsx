import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { UserPermission } from "src/services/user.service";
import { UserContext } from "src/shared/contexts/UserContext";

interface PermissionGuardProps {
  require: string;
  entity?: any;
  children: React.ReactElement;
  alternative?: React.ReactElement | string | null;
}

const PermissionGuard = ({
  require,
  entity,
  children,
  alternative,
}: PermissionGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    let newIsShown =
      (require === UserPermission.editUsers &&
        (user?.permissions?.includes(UserPermission.editUsers) ||
          user?.id === entity?.id)) ||
      (require === UserPermission.listUsers &&
        user?.permissions?.includes(UserPermission.listUsers));

    setIsShown(newIsShown);
  }, [user, entity, require]);

  if (isShown) {
    return children;
  }
  return <>{alternative}</>;
};

export { PermissionGuard };
