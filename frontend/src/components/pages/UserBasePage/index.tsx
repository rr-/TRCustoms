import { useContext } from "react";
import { useQuery } from "react-query";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { UserSidebar } from "src/components/common/UserSidebar";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
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

  const userResult = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => UserService.getUserById(userId)
  );

  usePageMetadata(
    () => ({
      ready: !userResult.isLoading,
      title: userResult?.data?.username,
      description: userResult?.data?.username
        ? `Check out ${userResult?.data?.username}'s profile page!`
        : null,
      image: userResult?.data?.picture?.url || "/anonymous.svg",
    }),
    [userResult]
  );

  if (userResult.error) {
    return <p>{userResult.error.message}</p>;
  }

  if (userResult.isLoading || !userResult.data) {
    return <Loader />;
  }

  const user = userResult.data;

  const subheader = `${user.first_name} ${user.last_name}`.trim();
  const showSubheader =
    user.is_active && subheader && subheader !== user.username;
  return (
    <SidebarLayout
      header={`${user.username}'s profile`}
      subheader={showSubheader ? subheader : undefined}
      sidebar={<UserSidebar user={user} />}
    >
      {children({
        user,
        isLoggedIn: userId === loggedInUser?.id,
      })}
    </SidebarLayout>
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
