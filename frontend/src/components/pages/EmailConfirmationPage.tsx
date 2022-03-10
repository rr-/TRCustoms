import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { TitleContext } from "src/contexts/TitleContext";
import { UserService } from "src/services/UserService";
import { UserDetails } from "src/services/UserService";
import { extractErrorMessage } from "src/utils";

interface UserPageParams {
  token: string;
}

const EmailConfirmationPage = () => {
  const [user, setUser] = useState<UserDetails | undefined>();
  const [error, setError] = useState<string | undefined>();
  const { setTitle } = useContext(TitleContext);
  const { token } = (useParams() as unknown) as UserPageParams;

  useEffect(() => {
    const run = async () => {
      try {
        setUser(await UserService.confirmEmail(token));
      } catch (err) {
        setError(extractErrorMessage(err));
      }
    };
    run();
  }, [token, setUser, setError]);

  useEffect(() => {
    setTitle("Registration finish");
  }, [setTitle]);

  if (user) {
    return (
      <div className="EmailConfirmationPage">
        {user.is_active ? (
          <p>
            Your email was confirmed. You can now{" "}
            <Link to={"/login"}>log in</Link> :)
          </p>
        ) : (
          <>
            <p>
              Your account was created and it now needs to be activated by our
              staff. Please have patience :)
            </p>
            <p>
              In the meantime, why don't you take a look at{" "}
              <Link to={"/"}>some levels</Link>?
            </p>
          </>
        )}
      </div>
    );
  } else if (error) {
    return (
      <div className="EmailConfirmationPage">
        <p>There was something wrong with email confirmation.</p>
        <p>{error}</p>
      </div>
    );
  } else {
    return <Loader />;
  }
};

export { EmailConfirmationPage };
