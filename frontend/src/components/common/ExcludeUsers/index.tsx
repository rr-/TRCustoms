import { useEffect } from "react";
import { useState } from "react";
import type { UserNested } from "src/services/UserService";
import { useUser } from "src/stores/user";

interface ExcludeUsersProps {
  users: UserNested[];
  alternative?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const ExcludeUsers = ({ users, alternative, children }: ExcludeUsersProps) => {
  const { user } = useUser();
  const [isShown, setIsShown] = useState<boolean>(false);

  useEffect(() => {
    setIsShown(!user || users.every((u) => u.id !== user.id));
  }, [user, users]);

  return <>{isShown ? children : alternative}</>;
};

export { ExcludeUsers };
