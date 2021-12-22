import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { UserContext } from "src/shared/contexts/UserContext";

interface PermissionGuardProps {
  require: string;
  entity?: any;
  children: React.ReactElement;
}

const PermissionGuard = ({
  require,
  entity,
  children,
}: PermissionGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    let newIsShown =
      (require === "canEditUsers" && user?.id === entity?.id) ||
      (require === "canListUsers" && !!user);

    setIsShown(newIsShown);
  }, [user, entity, require]);

  if (isShown) {
    return children;
  }
  return <></>;
};

export { PermissionGuard };
