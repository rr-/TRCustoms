import { useEffect, useContext, useState } from "react";
import { UserContext } from "src/shared/contexts/UserContext";

interface IPermissionGuard {
  require: string;
  entity?: any;
  children: any;
}

const PermissionGuard: React.FunctionComponent<IPermissionGuard> = ({
  require,
  entity,
  children,
}) => {
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
