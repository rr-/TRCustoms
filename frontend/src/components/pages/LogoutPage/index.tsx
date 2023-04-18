import { useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import { AuthService } from "src/services/AuthService";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  usePageMetadata(() => ({ ready: true, title: "Logout" }), []);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    navigate("/");
  }, [navigate, setUser]);

  return null;
};

export { LogoutPage };
