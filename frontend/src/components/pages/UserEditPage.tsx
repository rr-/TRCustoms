import { useCallback } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserService } from "src/services/user.service";
import type { User } from "src/services/user.service";
import Loader from "src/shared/components/Loader";
import UserForm from "src/shared/components/UserForm";
import { UserContext } from "src/shared/contexts/UserContext";

const UserEditPage = () => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const { userId } = useParams();

  const result = useQuery<User, Error>(
    [UserService.getUserById, userId],
    async () => await UserService.getUserById(+userId)
  );

  const submit = useCallback(
    (outUser, password) => {
      if (outUser.id === userContext.user.id) {
        userContext.setUser(outUser);
      }
    },
    [userContext]
  );

  const goBack = useCallback(() => {
    navigate(`/users/${userId}`);
  }, [navigate, userId]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading) {
    return <Loader />;
  }

  const user = result.data;

  return (
    <div id="UserEditPage">
      <h1>Editing {user.username}'s profile</h1>

      <UserForm onGoBack={goBack} onSubmit={submit} user={user} />
    </div>
  );
};

export default UserEditPage;
