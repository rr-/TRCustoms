import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { Error403Page } from "src/components/pages/ErrorPage";
import { UserContext } from "src/contexts/UserContext";
import type { UserDetails } from "src/services/UserService";
import type { UserNested } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";

interface CommonGuardProps {
  alternative?: React.ReactNode | undefined;
  children: React.ReactNode;
}

interface GenericGuardProps extends CommonGuardProps {
  isShown: boolean;
}

interface PermissionGuardProps extends CommonGuardProps {
  require: UserPermission | string;
  owningUsers?: UserNested[] | undefined;
}

interface PageGuardProps {
  require: UserPermission | string;
  children: React.ReactNode;
  owningUserIds?: number[] | undefined;
}

interface UserGuardProps extends CommonGuardProps {
  user?: UserNested | undefined;
}

const anonymousPermissions = [UserPermission.viewUsers];

const GenericGuard = ({
  isShown,
  children,
  alternative,
}: GenericGuardProps) => {
  return <>{isShown ? children : alternative}</>;
};

const hasPermission = (
  loggedInUser: UserDetails,
  require: UserPermission | string,
  owningUserIds?: number[],
): boolean => {
  return (
    anonymousPermissions.some((r) => r === require) ||
    loggedInUser?.permissions?.some((r) => r === require) ||
    !!(
      owningUserIds &&
      loggedInUser?.id &&
      owningUserIds.includes(loggedInUser.id)
    )
  );
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
      hasPermission(
        user,
        require,
        owningUsers?.map((u) => u.id),
      ),
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

const PageGuard = ({ require, owningUserIds, children }: PageGuardProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    setIsShown(hasPermission(user, require, owningUserIds));
  }, [user, owningUserIds, require]);

  return (
    <GenericGuard alternative={<Error403Page />} isShown={isShown}>
      {children}
    </GenericGuard>
  );
};

export { hasPermission, PermissionGuard, LoggedInUserGuard, PageGuard };
