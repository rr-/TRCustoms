import { useCallback } from "react";
import { useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { PageGuard } from "src/components/common/PermissionGuard";
import { UserForm } from "src/components/common/UserForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserContext } from "src/contexts/UserContext";
import { UserService } from "src/services/UserService";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";

interface UserEditPageParams {
  userId: string;
}

interface UserEditViewProps {
  userId: string;
}

const UserEditPageView = ({ userId }: UserEditViewProps) => {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  const result = useQuery<UserDetails, Error>(
    ["user", UserService.getUserById, userId],
    async () => await UserService.getUserById(+userId)
  );

  const handleSubmit = useCallback(
    (outUser: UserDetails, password: string | null) => {
      if (outUser.id === userContext.user.id) {
        userContext.setUser(outUser);
      }
    },
    [userContext]
  );

  usePageMetadata(() => ({ ready: true, title: "Editing user profile" }), []);

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
    <PlainLayout header={`Editing ${user.username}'s profile`}>
      <UserForm onGoBack={handleBack} onSubmit={handleSubmit} user={user} />
    </PlainLayout>
  );
};

const UserEditPage = () => {
  const { userId } = (useParams() as unknown) as UserEditPageParams;

  return (
    <PageGuard require={UserPermission.editUsers} owningUserIds={[+userId]}>
      <UserEditPageView userId={userId} />
    </PageGuard>
  );
};

export { UserEditPage };
