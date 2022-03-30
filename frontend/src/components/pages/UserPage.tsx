import "./UserPage.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { LevelsTable } from "src/components/LevelsTable";
import { Loader } from "src/components/Loader";
import { Markdown } from "src/components/Markdown";
import { PermissionGuard } from "src/components/PermissionGuard";
import { LoggedInUserGuard } from "src/components/PermissionGuard";
import { PageGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { ReviewsList } from "src/components/ReviewsList";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { UserPicture } from "src/components/UserPicture";
import { UserActivatePushButton } from "src/components/buttons/UserActivatePushButton";
import { UserBanPushButton } from "src/components/buttons/UserBanPushButton";
import { UserDeactivatePushButton } from "src/components/buttons/UserDeactivatePushButton";
import { UserUnbanPushButton } from "src/components/buttons/UserUnbanPushButton";
import { IconPencil } from "src/components/icons";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { formatDate } from "src/utils";

interface UserPageParams {
  userId: string;
}

const getLevelSearchQuery = (userId: number): LevelSearchQuery => ({
  page: null,
  sort: "-created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [+userId],
  isApproved: true,
});

const getReviewSearchQuery = (userId: number): ReviewSearchQuery => ({
  authors: [+userId],
  page: null,
  sort: "-created",
  search: "",
});

interface UserPageViewProps {
  userId: string;
}

const UserPageView = ({ userId }: UserPageViewProps) => {
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const [levelSearchQuery, setLevelSearchQuery] = useState<LevelSearchQuery>(
    getLevelSearchQuery(+userId)
  );
  const [reviewSearchQuery, setReviewSearchQuery] = useState<ReviewSearchQuery>(
    getReviewSearchQuery(+userId)
  );

  const userResult = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => UserService.getUserById(+userId)
  );

  useEffect(() => {
    setTitle(userResult?.data?.username || "");
  }, [setTitle, userResult]);

  useEffect(() => {
    setLevelSearchQuery(getLevelSearchQuery(+userId));
    setReviewSearchQuery(getReviewSearchQuery(+userId));
  }, [userId]);

  if (userResult.error) {
    return <p>{userResult.error.message}</p>;
  }

  if (userResult.isLoading || !userResult.data) {
    return <Loader />;
  }

  const handleUserRejection = () => {
    navigate("/");
  };

  const user = userResult.data;

  return (
    <div className="UserPage">
      <header className="UserPage--header">
        <h1 className="UserPage--headerWrapper">{user.username}'s profile</h1>
        {user.is_active &&
          (user.first_name || user.last_name) &&
          `${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
      </header>

      <aside className="UserPage--sidebar">
        <SidebarBox
          header={
            <div className="UserPage--picture">
              <UserPicture user={user} />
            </div>
          }
          actions={
            <>
              <PermissionGuard require={UserPermission.uploadLevels}>
                <LoggedInUserGuard user={user}>
                  <PushButton to={"/my-levels"}>My levels</PushButton>
                </LoggedInUserGuard>
              </PermissionGuard>
              {user.is_active ? (
                <>
                  <PermissionGuard
                    require={UserPermission.editUsers}
                    owningUsers={[user]}
                  >
                    <PushButton
                      icon={<IconPencil />}
                      to={`/users/${user.id}/edit`}
                    >
                      Edit profile
                    </PushButton>
                  </PermissionGuard>
                  <PermissionGuard require={UserPermission.editUsers}>
                    {user.is_banned ? (
                      <UserUnbanPushButton user={user} />
                    ) : (
                      !user.is_superuser && <UserBanPushButton user={user} />
                    )}
                    {!user.is_superuser && (
                      <UserDeactivatePushButton user={user}>
                        Deactivate
                      </UserDeactivatePushButton>
                    )}
                  </PermissionGuard>
                </>
              ) : user.is_pending_activation ? (
                <PermissionGuard require={UserPermission.editUsers}>
                  <UserActivatePushButton user={user} />
                  {!user.is_superuser && (
                    <UserDeactivatePushButton
                      onComplete={handleUserRejection}
                      user={user}
                    />
                  )}
                </PermissionGuard>
              ) : undefined}
            </>
          }
        >
          <DefinitionList>
            <DefinitionItemGroup>
              <DefinitionItem term="Joined">
                {formatDate(user.date_joined) || "Unknown"}
              </DefinitionItem>

              <DefinitionItem term="Country">
                {user.country?.name || "Unknown"}
              </DefinitionItem>
            </DefinitionItemGroup>

            <DefinitionItemGroup>
              <DefinitionItem term="Authored levels">
                {user.authored_level_count}
              </DefinitionItem>

              <DefinitionItem term="Reviewed levels">
                {user.reviewed_level_count}
              </DefinitionItem>

              {!!(user.trle_reviewer_id && user.trle_author_id) && (
                <DefinitionItem term="Links">
                  {user.trle_reviewer_id && (
                    <a
                      href={`https://www.trle.net/sc/reviewerfeatures.php?rid=${user.trle_reviewer_id}`}
                    >
                      TRLE.net (reviewer)
                    </a>
                  )}
                  <br />
                  {user.trle_author_id && (
                    <a
                      href={`https://www.trle.net/sc/authorfeatures.php?aid=${user.trle_author_id}`}
                    >
                      TRLE.net (author)
                    </a>
                  )}
                </DefinitionItem>
              )}
            </DefinitionItemGroup>
          </DefinitionList>
        </SidebarBox>
      </aside>

      <div className="UserPage--main">
        <Section className="UserPage--basicInfo">
          <SectionHeader>About</SectionHeader>
          {user.is_active && user.bio ? (
            <Markdown>{user.bio}</Markdown>
          ) : (
            <p>This user prefers to keep an air of mystery around them.</p>
          )}
        </Section>

        <Section className="UserPage--authoredLevels">
          <SectionHeader>Authored levels</SectionHeader>
          <LevelsTable
            searchQuery={levelSearchQuery}
            onSearchQueryChange={setLevelSearchQuery}
          />
        </Section>

        <Section className="UserPage--reviewedLevels">
          <SectionHeader>Reviews</SectionHeader>
          <ReviewsList
            showLevels={true}
            searchQuery={reviewSearchQuery}
            onSearchQueryChange={setReviewSearchQuery}
          />
        </Section>
      </div>
    </div>
  );
};

const UserPage = () => {
  const { userId } = (useParams() as unknown) as UserPageParams;
  return (
    <PageGuard require={UserPermission.viewUsers} owningUserIds={[+userId]}>
      <UserPageView userId={userId} />
    </PageGuard>
  );
};

export { UserPage };
