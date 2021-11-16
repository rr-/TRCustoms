import "./NavBar.css";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "src/shared/contexts/UserContext";

interface INavBar {}

const NavBar: React.FunctionComponent<INavBar> = () => {
  const { user } = useContext(UserContext);

  return (
    <div id="TopNavBar">
      <div className="MainContainer">
        <nav>
          <div className="TopNavBar--left">
            <h1>
              <Link to={"/"}>TRCustoms.org</Link>
            </h1>
          </div>

          <div className="TopNavBar--right">
            {user ? (
              <>
                <p>
                  Logged in as <Link to={"/profile"}>{user.username}</Link>.
                </p>
                <ul>
                  <li>
                    <Link to={"/logout"}>Log out</Link>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p>Not logged in.</p>
                <ul>
                  <li>
                    <Link to={"/login"}>Log in</Link>
                  </li>
                  <li>
                    <Link to={"/register"}>Register</Link>
                  </li>
                </ul>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
