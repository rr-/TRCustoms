import { useEffect } from "react";
import { withRouter, useLocation } from "react-router-dom";

const ScrollToTop = ({ children }: any) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [location]);

  return children || null;
};

export default withRouter(ScrollToTop);
