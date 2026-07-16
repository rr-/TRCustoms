import styles from "./index.module.css";
import type { LinkProps } from "react-router-dom";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useResolvedPath } from "react-router-dom";
import appStyles from "src/components/App/index.module.css";
import { Logo } from "src/components/common/Logo";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserPicture } from "src/components/common/UserPicture";
import { UserPermission } from "src/services/UserService";
import { useUser } from "src/stores/user";

const MyNavLink = ({ children, ...args }: any) => {
  return (
    <NavLink
      {...args}
      className={({ isActive, isPending }) =>
        [isPending ? styles.pending : "", isActive ? styles.active : ""].join(
          " ",
        )
      }
    >
      {children}
    </NavLink>
  );
};

const LevelsNavLink = ({ children, to, ...rest }: LinkProps) => {
  const location = useLocation();
  const path = useResolvedPath(to);

  let locationPathname = location.pathname;
  let toPathname = path.pathname;
  locationPathname = locationPathname.toLowerCase();
  toPathname = toPathname.toLowerCase();

  const isActive =
    locationPathname === toPathname ||
    locationPathname.match(/^\/?(genres|tags|levels(\/(?!upload)|$))/);

  const ariaCurrent: "page" | undefined = isActive ? "page" : undefined;
  const className = [isActive ? styles.active : null].filter(Boolean).join(" ");

  return (
    <Link to={to} aria-current={ariaCurrent} className={className} {...rest}>
      {children}
    </Link>
  );
};

const NavBar = () => {
  const { user } = useUser();

  return (
    <div className={appStyles.mainContainer}>
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
              <MyNavLink to={"/"}>Home</MyNavLink>
            </li>
            <li className={styles.listItem}>
              <LevelsNavLink to={"/levels"}>Levels</LevelsNavLink>
            </li>
            <li className={styles.listItem}>
              <MyNavLink to={"/reviews"}>Reviews</MyNavLink>
            </li>
            <li className={styles.listItem}>
              <MyNavLink to={"/extras"}>Extras</MyNavLink>
            </li>
            <li className={styles.listItem}>
              <MyNavLink to={"/about"}>About</MyNavLink>
            </li>

            <li className={`${styles.listItem} ${styles.grow}`} />

            <PermissionGuard require={UserPermission.uploadLevels}>
              <li className={styles.listItem}>
                <MyNavLink to={"/levels/upload"}>Upload level</MyNavLink>
              </li>
            </PermissionGuard>
            <PermissionGuard require={UserPermission.editLevels}>
              <li className={styles.listItem}>
                <MyNavLink to={"/mod"}>Moderate</MyNavLink>
              </li>
            </PermissionGuard>
            <li className={styles.listItem}>
              <MyNavLink to={"/settings"}>Settings</MyNavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export { NavBar };
