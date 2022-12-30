import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { LevelList } from "src/components/common/LevelList";
import { ReviewsList } from "src/components/common/ReviewsList";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { Markdown } from "src/components/markdown/Markdown";
import { UserBasePage } from "src/components/pages/UserBasePage";
import type { UserBasePageChildRenderProps } from "src/components/pages/UserBasePage";
import type { LevelSearchQuery } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";

const getLevelSearchQuery = (
  userId: number,
  isLoggedIn: boolean
): LevelSearchQuery => ({
  page: null,
  sort: "-created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  difficulties: [],
  durations: [],
  authors: [userId],
  isApproved: isLoggedIn ? null : true,
});

const getReviewSearchQuery = (userId: number): ReviewSearchQuery => ({
  authors: [userId],
  page: null,
  sort: "-created",
  search: "",
});

const UserPageView = ({ user, isLoggedIn }: UserBasePageChildRenderProps) => {
  const [levelSearchQuery, setLevelSearchQuery] = useState<LevelSearchQuery>(
    getLevelSearchQuery(user.id, isLoggedIn)
  );
  const [reviewSearchQuery, setReviewSearchQuery] = useState<ReviewSearchQuery>(
    getReviewSearchQuery(user.id)
  );

  useEffect(() => {
    setLevelSearchQuery(getLevelSearchQuery(user.id, isLoggedIn));
    setReviewSearchQuery(getReviewSearchQuery(user.id));
  }, [user.id, isLoggedIn]);

  return (
    <>
      <Section className="UserPage--basicInfo ChildMarginClear">
        <SectionHeader>About</SectionHeader>
        {user.is_active && user.bio ? (
          <Markdown>{user.bio}</Markdown>
        ) : (
          <p>This user prefers to keep an air of mystery around them.</p>
        )}
      </Section>

      <Section className="UserPage--authoredLevels">
        <SectionHeader>Levels authored</SectionHeader>
        <LevelList
          showStatus={isLoggedIn}
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
    </>
  );
};

interface UserPageParams {
  userId: string;
}

const UserPage = () => {
  const { userId } = (useParams() as unknown) as UserPageParams;
  return (
    <UserBasePage userId={+userId}>
      {(props: UserBasePageChildRenderProps) => <UserPageView {...props} />}
    </UserBasePage>
  );
};

export { UserPage };
