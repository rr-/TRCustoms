import styles from "./index.module.css";
import { useContext } from "react";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useResolvedPath } from "react-router-dom";
import { Logo } from "src/components/common/Logo";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserPicture } from "src/components/common/UserPicture";
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
    <div className="MainContainer">
      <div className={styles.wrapper}>
        <nav className={styles.primary}>
          <h1 className={styles.header}>
            <Link className={styles.headerLink} to={"/"}>
              <div className={styles.logo}>
                <Logo />
              </div>
              TRCustoms.org
            </Link>
          </h1>
          <ul className={`${styles.list} ${styles.grow}`}>
            {user ? (
              <>
                <li className={styles.listItem}>
                  <Link className={styles.userPicLink} to={`/users/${user.id}`}>
                    <UserPicture user={user} />
                    {user.username}
                  </Link>
                </li>
                <li className={styles.listItem}>
                  <Link to={"/logout"}>Log out</Link>
                </li>
              </>
            ) : (
              <>
                <li className={styles.listItem}>Not logged in.</li>
                <li className={styles.listItem}>
                  <Link to={"/login"}>Log in</Link>
                </li>
                <li className={styles.listItem}>
                  <Link to={"/register"}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <nav className={styles.secondary}>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <NavLink to={"/"}>Home</NavLink>
            </li>
            <li className={styles.listItem}>
              <LevelsNavLink to={"/levels"}>Levels</LevelsNavLink>
            </li>
            <li className={styles.listItem}>
              <NavLink to={"/genres"}>Genres</NavLink>
            </li>
            <li className={styles.listItem}>
              <NavLink to={"/tags"}>Tags</NavLink>
            </li>
            <li className={styles.listItem}>
              <NavLink to={"/reviews"}>Reviews</NavLink>
            </li>
            <li className={styles.listItem}>
              <NavLink to={"/about"}>About</NavLink>
            </li>

            <li className={`${styles.listItem} ${styles.grow}`} />

            <PermissionGuard require={UserPermission.uploadLevels}>
              <li className={styles.listItem}>
                <NavLink to={"/levels/upload"}>Upload level</NavLink>
              </li>
            </PermissionGuard>
            <PermissionGuard require={UserPermission.editLevels}>
              <li className={styles.listItem}>
                <NavLink to={"/mod"}>Moderate</NavLink>
              </li>
            </PermissionGuard>
            <li className={styles.listItem}>
              <NavLink to={"/settings"}>Settings</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export { NavBar };
