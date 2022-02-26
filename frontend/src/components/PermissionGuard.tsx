import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { UserContext } from "src/contexts/UserContext";
import type { UserNested } from "src/services/UserService";

interface CommonGuardProps {
  alternative?: React.ReactNode | undefined;
  children: React.ReactNode;
}

interface GenericGuardProps extends CommonGuardProps {
  isShown: boolean;
}

interface PermissionGuardProps extends CommonGuardProps {
  require: string;
  owningUsers?: UserNested[] | undefined;
}

interface UserGuardProps extends CommonGuardProps {
  user?: UserNested | undefined;
}

const GenericGuard = ({
  isShown,
  children,
  alternative,
}: GenericGuardProps) => {
  return <>{isShown ? children : alternative}</>;
};

const PermissionGuard = ({
  require,
  owningUsers,
  ...props
}: PermissionGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    setIsShown(
      user?.permissions?.includes(require) ||
        (owningUsers && owningUsers.map((u) => u.id).includes(user?.id))
    );
  }, [user, owningUsers, require]);

  return <GenericGuard {...props} isShown={isShown} />;
};

const LoggedInUserGuard = ({ user, ...props }: UserGuardProps) => {
  const userContext = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    setIsShown(user?.id === userContext.user?.id);
  }, [user, userContext]);

  return <GenericGuard {...props} isShown={isShown} />;
};

export { PermissionGuard, LoggedInUserGuard };
