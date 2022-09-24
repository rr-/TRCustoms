import { useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Logout");
  }, [setTitle]);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    navigate("/");
  }, [navigate, setUser]);

  return null;
};

export { LogoutPage };
