import "./NavBar.css";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import UserPicture from "src/shared/components/UserPicture";
import { UserContext } from "src/shared/contexts/UserContext";

interface INavBar {}

const NavBar: React.FunctionComponent<INavBar> = () => {
  const { user } = useContext(UserContext);

  return (
    <div id="TopNavBar">
      <div id="PrimaryNavBar">
        <div className="MainContainer">
          <nav>
            <div className="PrimaryNavBar--left">
              <h1>
                <Link to={"/"}>TRCustoms.org</Link>
              </h1>
            </div>

            <div className="PrimaryNavBar--right">
              {user ? (
                <>
                  <UserPicture className="PrimaryNavBar--userPic" user={user} />
                  <p>
                    <Link to={`/users/${user.id}`}>{user.username}</Link>
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
      <div id="SecondaryNavBar">
        <div className="MainContainer">
          <nav>
            <ul>
              <li>
                <NavLink exact to={"/"}>
                  Levels
                </NavLink>
              </li>
              <li>
                <NavLink to={"/tags"}>Tags</NavLink>
              </li>
              <li>
                <NavLink to={"/genres"}>Genres</NavLink>
              </li>
              <PermissionGuard require="canListUsers">
                <li>
                  <NavLink to={"/users"}>Users</NavLink>
                </li>
              </PermissionGuard>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
