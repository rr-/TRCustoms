import { useCallback } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserService } from "src/services/user.service";
import type { User } from "src/services/user.service";
import Loader from "src/shared/components/Loader";
import UserForm from "src/shared/components/UserForm";

const UserEditPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const result = useQuery<User, Error>(
    ["user", userId],
    async () => await UserService.getUserById(+userId)
  );

  const goBack = useCallback(() => {
    navigate(`/users/${userId}`);
  }, [navigate, userId]);

  if (result.isLoading) {
    return <Loader />;
  }

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  const user = result.data;

  return (
    <div id="UserEditPage">
      <h1>Editing {user.username}'s profile</h1>

      <UserForm onGoBack={goBack} user={user} />
    </div>
  );
};

export default UserEditPage;
