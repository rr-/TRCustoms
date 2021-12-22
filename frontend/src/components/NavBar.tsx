import "./NavBar.css";
import { CogIcon } from "@heroicons/react/outline";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { ThemeManager } from "src/shared/components/ThemeManager";
import UserPicture from "src/shared/components/UserPicture";
import { UserContext } from "src/shared/contexts/UserContext";

interface INavBar {}

const NavBar: React.FunctionComponent<INavBar> = () => {
  const { user } = useContext(UserContext);

  const checkRootLinkActive = (match, location) => {
    if (!location) {
      return false;
    }
    const { pathname } = location;
    const { url } = match;
    return pathname === url || pathname.match(/^\/?levels(\/|$)/);
  };

  return (
    <div className="TopNavBar">
      <div className="TopNavBar--primary">
        <div className="MainContainer">
          <div className="NavBar">
            <div className="NavBar--left">
              <h1>
                <Link to={"/"}>
                  <CogIcon className="icon" /> TRCustoms
                </Link>
              </h1>
            </div>

            <nav className="NavBar--right">
              {user ? (
                <>
                  <Link
                    className="TopNavBar--primary--userPicLink"
                    to={`/users/${user.id}`}
                  >
                    <UserPicture
                      className="TopNavBar--primary--userPic"
                      user={user}
                    />
                    {user.username}
                  </Link>
                  <ul className="TopNavBar--list">
                    <li className="TopNavBar--listItem">
                      <Link to={"/logout"}>Log out</Link>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p>Not logged in.</p>
                  <ul className="TopNavBar--list">
                    <li className="TopNavBar--listItem">
                      <Link to={"/login"}>Log in</Link>
                    </li>
                    <li className="TopNavBar--listItem">
                      <Link to={"/register"}>Register</Link>
                    </li>
                  </ul>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      <div className="TopNavBar--secondary">
        <div className="MainContainer">
          <div className="NavBar">
            <nav className="NavBar NavBar--left">
              <ul className="TopNavBar--list">
                <li className="TopNavBar--listItem">
                  <NavLink isActive={checkRootLinkActive} to={"/"}>
                    Levels
                  </NavLink>
                </li>
                <li className="TopNavBar--listItem">
                  <NavLink to={"/tags"}>Tags</NavLink>
                </li>
                <li className="TopNavBar--listItem">
                  <NavLink to={"/genres"}>Genres</NavLink>
                </li>
                <PermissionGuard require="canListUsers">
                  <li className="TopNavBar--listItem">
                    <NavLink to={"/users"}>Users</NavLink>
                  </li>
                </PermissionGuard>
              </ul>
            </nav>
            <div className="NavBar NavBar--right">
              <ThemeManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
