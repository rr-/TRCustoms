import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { WalkthroughsTable } from "src/components/common/WalkthroughsTable";
import { UserBasePage } from "src/components/pages/UserBasePage";
import type { UserBasePageChildRenderProps } from "src/components/pages/UserBasePage";
import type { WalkthroughSearchQuery } from "src/services/WalkthroughService";

interface UserWalkthroughsPageParams {
  userId: string;
}

const getWalkthroughSearchQuery = (
  userId: number,
  isLoggedIn: boolean
): WalkthroughSearchQuery => ({
  authors: [userId],
  page: null,
  sort: "-created",
  search: "",
  isApproved: isLoggedIn ? undefined : true,
});

const UserWalkthroughsPageView = ({
  user,
  isLoggedIn,
}: UserBasePageChildRenderProps) => {
  const [walkthroughSearchQuery, setWalkthroughSearchQuery] = useState<
    WalkthroughSearchQuery
  >(getWalkthroughSearchQuery(user.id, isLoggedIn));

  useEffect(() => {
    setWalkthroughSearchQuery(getWalkthroughSearchQuery(user.id, isLoggedIn));
  }, [user.id, isLoggedIn]);

  return (
    <Section className="ChildMarginClear">
      <SectionHeader>Walkthroughs</SectionHeader>
      <WalkthroughsTable
        showLevelNames={true}
        showAuthors={false}
        showWalkthroughType={true}
        showStatus={isLoggedIn}
        searchQuery={walkthroughSearchQuery}
        onSearchQueryChange={setWalkthroughSearchQuery}
      />
    </Section>
  );
};

const UserWalkthroughsPage = () => {
  const { userId } = (useParams() as unknown) as UserWalkthroughsPageParams;
  return (
    <UserBasePage userId={+userId}>
      {(props: UserBasePageChildRenderProps) => (
        <UserWalkthroughsPageView {...props} />
      )}
    </UserBasePage>
  );
};

export { UserWalkthroughsPage };
