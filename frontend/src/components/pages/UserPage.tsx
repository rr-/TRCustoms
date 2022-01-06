import "./UserPage.css";
import { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import type { LevelSearchQuery } from "src/services/level.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import type { User } from "src/services/user.service";
import { UserPermission } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { LevelsTable } from "src/shared/components/LevelsTable";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { ReviewsTable } from "src/shared/components/ReviewsTable";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { UserPicture } from "src/shared/components/UserPicture";
import { formatDate } from "src/shared/utils";

interface UserPageParams {
  userId: string;
}

const UserPage = () => {
  const { userId } = (useParams() as unknown) as UserPageParams;
  const [levelSearchQuery, setLevelSearchQuery] = useState<LevelSearchQuery>({
    page: null,
    sort: "-created",
    search: null,
    tags: [],
    genres: [],
    engines: [],
    authors: [+userId],
  });
  const [reviewSearchQuery, setReviewSearchQuery] = useState<ReviewSearchQuery>(
    {
      authors: [+userId],
      page: null,
      sort: "-created",
      search: "",
    }
  );

  const result = useQuery<User, Error>(
    [UserService.getUserById, userId],
    async () => UserService.getUserById(+userId)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const user = result.data;

  return (
    <div id="UserPage">
      <header id="UserPage--header">
        <h1>{user.username}</h1>
        {user.is_active &&
          (user.first_name || user.last_name) &&
          `${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
      </header>

      <div id="UserPage--picture">
        <UserPicture user={user} />
      </div>

      <aside id="UserPage--sidebar">
        <SidebarBox
          actions={
            <PermissionGuard
              require={UserPermission.editUsers}
              owningUsers={[user]}
            >
              <PushButton to={`/users/${user.id}/edit`}>
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
          <ReviewsTable
            showLevels={true}
            showDetails={false}
            showAuthors={false}
            searchQuery={reviewSearchQuery}
            onSearchQueryChange={setReviewSearchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export { UserPage };
