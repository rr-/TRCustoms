import { useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import { TitleContext } from "src/shared/contexts/TitleContext";
import { UserContext } from "src/shared/contexts/UserContext";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("logout");
  }, [setTitle]);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    navigate("/");
  }, [navigate, setUser]);

  return null;
};

export { LogoutPage };
