import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/Loader";
import { TitleContext } from "src/contexts/TitleContext";
import { UserService } from "src/services/UserService";
import { extractErrorMessage } from "src/utils";

interface UserPageParams {
  token: string;
}

const EmailConfirmationPage = () => {
  const [success, setSuccess] = useState<boolean | undefined>();
  const { setTitle } = useContext(TitleContext);
  const { token } = (useParams() as unknown) as UserPageParams;

  useEffect(() => {
    const run = async () => {
      try {
        await UserService.confirmEmail(token);
        setSuccess(true);
      } catch (error) {
        alert(extractErrorMessage(error));
        setSuccess(false);
      }
    };
    run();
  }, [token, setSuccess]);

  useEffect(() => {
    setTitle("Registration finish");
  }, [setTitle]);

  if (success === undefined) {
    return <Loader />;
  } else if (success === true) {
    return (
      <div className="EmailConfirmationPage">
        <p>
          Your email was confirmed. Your account was created and it now needs to
          be activated by our staff. Please have patience :)
        </p>
        <p>
          {" "}
          In the meantime, why don't you take a look at{" "}
          <Link to={"/"}>some levels</Link>?
        </p>
      </div>
    );
  } else {
    return (
      <div className="EmailConfirmationPage">
        <p>There was something wrong with email confirmation.</p>
      </div>
    );
  }
};

export { EmailConfirmationPage };
