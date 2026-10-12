import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Loader } from "src/components/common/Loader";
import { hasPermission } from "src/components/common/PermissionGuard";
import { MessageForm } from "src/components/forms/MessageForm";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { UserLink } from "src/components/links/UserLink";
import { Error403Page } from "src/components/pages/ErrorPage";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";

const MessageSendPage = () => {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const result = useQuery<UserDetails, Error>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => UserService.getUserById(+userId),
  });

  const handleGoBack = useCallback(() => {
    navigate(`/users/${userId}`);
  }, [navigate, userId]);

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data ? `Send message to ${result.data.username}` : null,
    }),
    [result],
  );

  if (result.error) {
    return <ResponseErrorPage error={result.error} />;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const receiver = result.data;
  const canSend =
    receiver.can_message ||
    (user?.id !== receiver.id &&
      hasPermission(user, UserPermission.messageAsAdministrator));
  if (!user || !canSend) {
    return <Error403Page />;
  }

  return (
    <PlainLayout
      header={
        <>
          New message to: <UserLink user={receiver} />
        </>
      }
    >
      <MessageForm
        receiver={receiver}
        onGoBack={handleGoBack}
        onSubmit={(thread) => navigate(`/messages/threads/${thread.id}`)}
      />
    </PlainLayout>
  );
};

export { MessageSendPage };
