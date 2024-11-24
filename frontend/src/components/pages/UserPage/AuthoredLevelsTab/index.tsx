import { useState } from "react";
import { useEffect } from "react";
import { LevelList } from "src/components/common/LevelList";
import type { LevelSearchQuery } from "src/services/LevelService";
import type { UserDetails } from "src/services/UserService";

const getLevelSearchQuery = (
  userId: number,
  isLoggedIn: boolean
): LevelSearchQuery => ({
  page: null,
  sort: "-created",
  authors: [userId],
  isApproved: isLoggedIn ? null : true,
});

interface AuthoredLevelsTabProps {
  user: UserDetails;
  isLoggedIn: boolean;
}

const AuthoredLevelsTab = ({ user, isLoggedIn }: AuthoredLevelsTabProps) => {
  const [levelSearchQuery, setLevelSearchQuery] = useState<LevelSearchQuery>(
    getLevelSearchQuery(user.id, isLoggedIn)
  );

  useEffect(() => {
    setLevelSearchQuery(getLevelSearchQuery(user.id, isLoggedIn));
  }, [user.id, isLoggedIn]);

  return (
    <LevelList
      showStatus={isLoggedIn}
      searchQuery={levelSearchQuery}
      onSearchQueryChange={setLevelSearchQuery}
    />
  );
};

export { AuthoredLevelsTab };
