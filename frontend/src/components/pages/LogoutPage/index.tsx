import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services/AuthService";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  usePageMetadata(() => ({ ready: true, title: "Logout" }), []);

  useEffect(() => {
    setUser(null);
    AuthService.logout();
    navigate("/");
  }, [navigate, setUser]);

  return null;
};

export { LogoutPage };
