import { useEffect } from "react";
import { createContext, useState } from "react";
import { IUser, UserService } from "src/services/user.service";

const UserContext = createContext<any>(null);

const UserContextProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<IUser | null>(null);

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
