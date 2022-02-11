import { useCallback } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserService } from "src/services/user.service";
import type { UserDetails } from "src/services/user.service";
import { Loader } from "src/shared/components/Loader";
import { UserForm } from "src/shared/components/UserForm";
import { TitleContext } from "src/shared/contexts/TitleContext";
import { UserContext } from "src/shared/contexts/UserContext";

interface UserEditPageParams {
  userId: string;
}

const UserEditPage = () => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const { setTitle } = useContext(TitleContext);
  const { userId } = (useParams() as unknown) as UserEditPageParams;

  const result = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => await UserService.getUserById(+userId)
  );

  const handleSubmit = useCallback(
    (outUser, password) => {
      if (outUser.id === userContext.user.id) {
        userContext.setUser(outUser);
      }
    },
    [userContext]
  );

  useEffect(() => {
    setTitle("editing user profile");
  }, [setTitle]);

  const handleBack = useCallback(() => {
    navigate(`/users/${userId}`);
  }, [navigate, userId]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const user = result.data;

  return (
    <div id="UserEditPage">
      <h1>Editing {user.username}'s profile</h1>

      <UserForm onGoBack={handleBack} onSubmit={handleSubmit} user={user} />
    </div>
  );
};

export { UserEditPage };
