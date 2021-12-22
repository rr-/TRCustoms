import { useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services/auth.service";
import { UserContext } from "src/shared/contexts/UserContext";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    navigate("/");
  }, [navigate, setUser]);

  return null;
};

export default LogoutPage;
