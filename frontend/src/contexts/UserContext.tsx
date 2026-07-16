import { useEffect } from "react";
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
      const user = await UserService.getCurrentUser();
      setUser(user);
    };

    fetchUser();
  }, [setUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContextProvider, UserContext };
