import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { UserContext } from "src/contexts/UserContext";
import type { UserNested } from "src/services/UserService";

interface ExcludeUsersProps {
  users: UserNested[];
  alternative?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const ExcludeUsers = ({ users, alternative, children }: ExcludeUsersProps) => {
  const { user } = useContext(UserContext);
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    setIsShown(!user || users.every((u) => u.id !== user.id));
  }, [user, users]);

  return <>{isShown ? children : alternative}</>;
};

export { ExcludeUsers };
