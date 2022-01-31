import "./UserPage.css";
import { PencilIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import type { LevelSearchQuery } from "src/services/level.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import type { UserDetails } from "src/services/user.service";
import { UserPermission } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { LevelsTable } from "src/shared/components/LevelsTable";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { ReviewsList } from "src/shared/components/ReviewsList";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { UserPicture } from "src/shared/components/UserPicture";
import { formatDate } from "src/shared/utils";

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

const UserPage = () => {
  const { userId } = (useParams() as unknown) as UserPageParams;
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
    <div id="UserPage">
      <header id="UserPage--header">
        <h1 className="UserPage--headerWrapper">{user.username}'s profile</h1>
        {user.is_active &&
          (user.first_name || user.last_name) &&
          `${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
      </header>

      <aside id="UserPage--sidebar">
        <SidebarBox
          header={
            <div id="UserPage--picture">
              <UserPicture user={user} />
            </div>
          }
          actions={
            <PermissionGuard
              require={UserPermission.editUsers}
              owningUsers={[user]}
            >
              <PushButton
                icon={<PencilIcon className="icon" />}
                to={`/users/${user.id}/edit`}
              >
                Edit profile
              </PushButton>
            </PermissionGuard>
          }
        >
          <dl>
            <dt>Joined</dt>
            <dd>{formatDate(user.date_joined) || "unknown"}</dd>

            <dt>Last seen</dt>
            <dd>{formatDate(user.last_login) || "never"}</dd>

            <div>
              <hr />
            </div>

            <dt>Authored levels</dt>
            <dd>{user.authored_level_count}</dd>

            <dt>Reviewed levels</dt>
            <dd>{user.reviewed_level_count}</dd>

            {user.trle_reviewer_id || user.trle_author_id ? (
              <>
                <dt>Links</dt>
                <dd>
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
                </dd>
              </>
            ) : null}
          </dl>
        </SidebarBox>
      </aside>

      <div id="UserPage--main">
        <section id="UserPage--basicInfo">
          <SectionHeader>About</SectionHeader>
          {user.is_active && user.bio ? (
            <Markdown children={user.bio} />
          ) : (
            <p>This user prefers to keep an air of mystery around them.</p>
          )}
        </section>

        <section id="UserPage--authoredLevels">
          <SectionHeader>Authored levels</SectionHeader>
          <LevelsTable
            searchQuery={levelSearchQuery}
            onSearchQueryChange={setLevelSearchQuery}
          />
        </section>

        <section id="UserPage--reviewedLevels">
          <ReviewsList
            showLevels={true}
            searchQuery={reviewSearchQuery}
            onSearchQueryChange={setReviewSearchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export { UserPage };
