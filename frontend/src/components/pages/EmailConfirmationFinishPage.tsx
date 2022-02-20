import { useEffect } from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { TitleContext } from "src/shared/contexts/TitleContext";

interface UserPageParams {
  success: string;
}

const EmailConfirmationFinishPage = () => {
  const { setTitle } = useContext(TitleContext);
  const { success } = (useParams() as unknown) as UserPageParams;

  useEffect(() => {
    setTitle("Registration finish");
  }, [setTitle]);

  return (
    <div className="EmailConfirmationFinishPage">
      {success === "1" ? (
        <>
          <p>
            Your email was confirmed. Your account was created and it now needs
            to be activated by our staff. Please have patience :)
          </p>
          <p>
            {" "}
            In the meantime, why don't you take a look at{" "}
            <Link to={"/"}>some levels</Link>?
          </p>
        </>
      ) : (
        <p>There was something wrong with email confirmation.</p>
      )}
    </div>
  );
};

export { EmailConfirmationFinishPage };
