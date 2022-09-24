import "./index.css";
import { useEffect } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { Loader } from "src/components/Loader";
import { PageGuard } from "src/components/PermissionGuard";
import { UserSidebar } from "src/components/UserSidebar";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface UserBasePageChildRenderProps {
  user: UserDetails;
  isLoggedIn: boolean;
}

interface UserBasePageViewProps {
  userId: number;
  children: (props: UserBasePageChildRenderProps) => React.ReactNode;
}

const UserBasePageView = ({ userId, children }: UserBasePageViewProps) => {
  const loggedInUser = useContext(UserContext).user;
  const { setTitle } = useContext(TitleContext);

  const userResult = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => UserService.getUserById(userId)
  );

  useEffect(() => {
    setTitle(userResult?.data?.username || "");
  }, [setTitle, userResult]);

  if (userResult.error) {
    return <p>{userResult.error.message}</p>;
  }

  if (userResult.isLoading || !userResult.data) {
    return <Loader />;
  }

  const user = userResult.data;

  return (
    <div className="UserBasePage">
      <header className="UserBasePage--header ChildMarginClear">
        <h1 className="UserBasePage--headerWrapper">
          {user.username}'s profile
        </h1>
        {user.is_active &&
          (user.first_name || user.last_name) &&
          `${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
      </header>

      <aside className="UserBasePage--sidebar">
        <UserSidebar user={user} />
      </aside>

      <div className="UserBasePage--main">
        {children({
          user,
          isLoggedIn: userId === loggedInUser?.id,
        })}
      </div>
    </div>
  );
};

interface UserBasePageProps {
  userId: number;
  children: (props: UserBasePageChildRenderProps) => React.ReactNode;
}

const UserBasePage = ({ userId, children }: UserBasePageProps) => {
  return (
    <PageGuard require={UserPermission.viewUsers} owningUserIds={[+userId]}>
      <UserBasePageView userId={userId}>{children}</UserBasePageView>
    </PageGuard>
  );
};

export type { UserBasePageChildRenderProps };
export { UserBasePage };
