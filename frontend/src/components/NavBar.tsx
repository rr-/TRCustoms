import "./NavBar.css";
import { useContext } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useResolvedPath } from "react-router-dom";
import { UserPermission } from "src/services/user.service";
import { Logo } from "src/shared/components/Logo";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { UserPicture } from "src/shared/components/UserPicture";
import { UserContext } from "src/shared/contexts/UserContext";

const LevelsNavLink = ({ children, to, ...rest }: LinkProps) => {
  let location = useLocation();
  let path = useResolvedPath(to);

  let locationPathname = location.pathname;
  let toPathname = path.pathname;
  locationPathname = locationPathname.toLowerCase();
  toPathname = toPathname.toLowerCase();

  let isActive =
    locationPathname === toPathname ||
    locationPathname.match(/^\/?levels(\/(?!upload)|$)/);

  let ariaCurrent: "page" | undefined = isActive ? "page" : undefined;
  let className = [isActive ? "active" : null].filter(Boolean).join(" ");

  return (
    <Link to={to} aria-current={ariaCurrent} className={className} {...rest}>
      {children}
    </Link>
  );
};

const NavBar = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="TopNavBar">
      <div className="TopNavBar--primary">
        <div className="MainContainer">
          <div className="NavBar">
            <div className="NavBar--left">
              <h1>
                <Link to={"/"}>
                  <Logo />
                  TRCustoms
                </Link>
              </h1>
            </div>

            <nav className="NavBar--right">
              <ul className="TopNavBar--list">
                {user ? (
                  <>
                    <li className="TopNavBar--listItem">
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
                    </li>
                    <li className="TopNavBar--listItem">
                      <Link to={"/logout"}>Log out</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="TopNavBar--listItem">Not logged in.</li>
                    <li className="TopNavBar--listItem">
                      <Link to={"/login"}>Log in</Link>
                    </li>
                    <li className="TopNavBar--listItem">
                      <Link to={"/register"}>Register</Link>
                    </li>
                  </>
                )}
              </ul>
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
                  <NavLink to={"/"}>Home</NavLink>
                </li>
                <li className="TopNavBar--listItem">
                  <LevelsNavLink to={"/levels"}>Levels</LevelsNavLink>
                </li>
                <li className="TopNavBar--listItem">
                  <NavLink to={"/genres"}>Genres</NavLink>
                </li>
                <li className="TopNavBar--listItem">
                  <NavLink to={"/tags"}>Tags</NavLink>
                </li>
                <PermissionGuard require={UserPermission.listUsers}>
                  <li className="TopNavBar--listItem">
                    <NavLink to={"/users"}>Users</NavLink>
                  </li>
                </PermissionGuard>
              </ul>
            </nav>
            <div className="NavBar NavBar--right">
              <ul className="TopNavBar--list">
                <PermissionGuard require={UserPermission.uploadLevels}>
                  <li className="TopNavBar--listItem">
                    <NavLink to={"/levels/upload"}>Upload level</NavLink>
                  </li>
                </PermissionGuard>
                <PermissionGuard require={UserPermission.editLevels}>
                  <li className="TopNavBar--listItem">
                    <NavLink to={"/mod"}>Moderate</NavLink>
                  </li>
                </PermissionGuard>
                <li className="TopNavBar--listItem">
                  <NavLink to={"/settings"}>Settings</NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NavBar };
