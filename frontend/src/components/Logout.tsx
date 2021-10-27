import { History } from "history";
import { useEffect, useContext } from "react";
import { AuthService } from "src/services/auth.service";
import { UserContext } from "src/shared/contexts/UserContext";

interface ILogout {
  history: History;
}

const Logout: React.FunctionComponent<ILogout> = ({ history }) => {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    history.push("/");
  }, [history, setUser]);

  return <></>;
};

export default Logout;
