import "./NavBar.css";
import { useContext } from "react";
import { Link } from "react-router-dom";
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
                    <Link to={"/profile"}>{user.username}</Link>
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
                <Link to={"/"}>Level listing</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
