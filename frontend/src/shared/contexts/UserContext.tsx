import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import type { UserDetails } from "src/services/user.service";
import { UserService } from "src/services/user.service";

interface UserContextProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<any>(null);

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
