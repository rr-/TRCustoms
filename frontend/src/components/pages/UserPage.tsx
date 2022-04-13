import "./UserPage.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { LevelsTable } from "src/components/LevelsTable";
import { Loader } from "src/components/Loader";
import { Markdown } from "src/components/Markdown";
import { PageGuard } from "src/components/PermissionGuard";
import { ReviewsList } from "src/components/ReviewsList";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { UserSidebar } from "src/components/UserSidebar";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";

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
        <UserSidebar user={user} />
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
          <SectionHeader>Levels authored</SectionHeader>
          <LevelsTable
            searchQuery={levelSearchQuery}
            onSearchQueryChange={setLevelSearchQuery}
          />
        </Section>

        <Section className="UserPage--reviewedLevels">
          <SectionHeader>Reviews posted</SectionHeader>
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
