import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import { UserService } from "src/services/UserService";
import { UserDetails } from "src/services/UserService";
import { usePageMetadata } from "src/stores/pageMetadata";
import { extractErrorMessage } from "src/utils/misc";

const EmailConfirmationPage = () => {
  const [user, setUser] = useState<UserDetails | undefined>();
  const [error, setError] = useState<string | undefined>();
  const { token = "" } = useParams();

  useEffect(() => {
    const run = async () => {
      try {
        setUser(await UserService.confirmEmail(token));
      } catch (err) {
        setError(extractErrorMessage(err) ?? undefined);
      }
    };
    run();
  }, [token, setUser, setError]);

  usePageMetadata(() => ({ ready: true, title: "Registration finish" }), []);

  if (user) {
    return (
      <PlainLayout>
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
      </PlainLayout>
    );
  } else if (error) {
    return <ResponseErrorPage error={error} />;
  } else {
    return <Loader />;
  }
};

export { EmailConfirmationPage };
