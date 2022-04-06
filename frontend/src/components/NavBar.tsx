import "./NavBar.css";
import { useContext } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useResolvedPath } from "react-router-dom";
import { Logo } from "src/components/Logo";
import { PermissionGuard } from "src/components/PermissionGuard";
import { UserPicture } from "src/components/UserPicture";
import { UserContext } from "src/contexts/UserContext";
import { UserPermission } from "src/services/UserService";

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
    <div className="NavBar">
      <nav className="MainContainer">
        <div className="NavBar--primary">
          <h1>
            <Link to={"/"}>
              <Logo />
              TRCustoms.org
            </Link>
          </h1>
          <ul className="NavBar--list NavBar--grow">
            {user ? (
              <>
                <li className="NavBar--listItem">
                  <Link
                    className="NavBar--userPicLink"
                    to={`/users/${user.id}`}
                  >
                    <UserPicture className="NavBar--userPic" user={user} />
                    {user.username}
                  </Link>
                </li>
                <li className="NavBar--listItem">
                  <Link to={"/logout"}>Log out</Link>
                </li>
              </>
            ) : (
              <>
                <li className="NavBar--listItem">Not logged in.</li>
                <li className="NavBar--listItem">
                  <Link to={"/login"}>Log in</Link>
                </li>
                <li className="NavBar--listItem">
                  <Link to={"/register"}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className="NavBar--secondary">
        <nav className="MainContainer">
          <ul className="NavBar--list">
            <li className="NavBar--listItem">
              <NavLink to={"/"}>Home</NavLink>
            </li>
            <li className="NavBar--listItem">
              <LevelsNavLink to={"/levels"}>Levels</LevelsNavLink>
            </li>
            <li className="NavBar--listItem">
              <NavLink to={"/genres"}>Genres</NavLink>
            </li>
            <li className="NavBar--listItem">
              <NavLink to={"/tags"}>Tags</NavLink>
            </li>
            <li className="NavBar--listItem">
              <NavLink to={"/about"}>About</NavLink>
            </li>

            <li className="NavBar--listItem NavBar--grow" />

            <PermissionGuard require={UserPermission.uploadLevels}>
              <li className="NavBar--listItem">
                <NavLink to={"/levels/upload"}>Upload level</NavLink>
              </li>
            </PermissionGuard>
            <PermissionGuard require={UserPermission.editLevels}>
              <li className="NavBar--listItem">
                <NavLink to={"/mod"}>Moderate</NavLink>
              </li>
            </PermissionGuard>
            <li className="NavBar--listItem">
              <NavLink to={"/settings"}>Settings</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export { NavBar };
