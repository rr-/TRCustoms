import { useEffect } from "react";
import { useMemo } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { UserDetails } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface UserContextProviderProps {
  children: React.ReactNode;
}

interface UserContextType {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);

  useEffect(() => {
    // try to log in when the application starts.
    const fetchUser = async () => {
      try {
        const user = await UserService.getCurrentUser();
        setUser(user);
      } catch {
        // A transient failure isn't a logout: leave the current user as-is
        // rather than forcing a signed-out state.
      }
    };

    fetchUser();
  }, [setUser]);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContextProvider, UserContext };
