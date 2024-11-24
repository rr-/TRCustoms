import { useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { Section } from "src/components/common/Section";
import type { TabPage } from "src/components/common/TabSwitch";
import { LightTabSwitch } from "src/components/common/TabSwitch";
import { UserSidebar } from "src/components/common/UserSidebar";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { Markdown } from "src/components/markdown/Markdown";
import { AuthoredLevelsTab } from "src/components/pages/UserPage/AuthoredLevelsTab";
import { PlaylistTab } from "src/components/pages/UserPage/PlaylistTab";
import { RatingsTab } from "src/components/pages/UserPage/RatingsTab";
import { ReviewsTab } from "src/components/pages/UserPage/ReviewsTab";
import { UserHeader } from "src/components/pages/UserPage/UserHeader";
import { WalkthroughsTab } from "src/components/pages/UserPage/WalkthroughsTab";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface UserPageParams {
  userId: string;
}

interface UserPageProps {
  tabName?: string;
}

const UserPage = ({ tabName }: UserPageProps) => {
  const navigate = useNavigate();
  const { userId } = (useParams() as unknown) as UserPageParams;
  const loggedInUser = useContext(UserContext).user;
  const isLoggedIn = +userId === loggedInUser?.id;

  const userResult = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => UserService.getUserById(+userId)
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

  const handleTabChange = (tab: TabPage) => {
    navigate(`/users/${user.id}/${tab.name}`);
  };

  const user = userResult.data;
  const tabs = [];

  if (user.authored_level_count > 0) {
    tabs.push({
      name: "authored_levels",
      label: "Levels",
      content: <AuthoredLevelsTab user={user} isLoggedIn={isLoggedIn} />,
    });
  }

  if (user.rated_level_count > 0) {
    tabs.push({
      name: "ratings",
      label: "Ratings",
      content: <RatingsTab user={user} isLoggedIn={isLoggedIn} />,
    });
  }

  if (user.reviewed_level_count > 0) {
    tabs.push({
      name: "reviews",
      label: "Reviews",
      content: <ReviewsTab user={user} isLoggedIn={isLoggedIn} />,
    });
  }

  if (user.authored_walkthrough_count > 0) {
    tabs.push({
      name: "walkthroughs",
      label: "Walkthroughs",
      content: <WalkthroughsTab user={user} isLoggedIn={isLoggedIn} />,
    });
  }

  tabs.push({
    name: "playlist",
    label: "Playlist",
    content: <PlaylistTab user={user} />,
  });

  return (
    <PageGuard require={UserPermission.viewUsers} owningUserIds={[+userId]}>
      <SidebarLayout
        header={<UserHeader user={user} />}
        sidebar={<UserSidebar user={user} />}
      >
        {user.is_active && user.bio ? (
          <Section>
            <Markdown>{user.bio}</Markdown>
          </Section>
        ) : null}

        <LightTabSwitch
          tabs={tabs}
          tabName={tabName}
          onTabChange={handleTabChange}
        />
      </SidebarLayout>
    </PageGuard>
  );
};

export { UserPage };
