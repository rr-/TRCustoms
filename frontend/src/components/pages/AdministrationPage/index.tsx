import styles from "./index.module.css";
import { Button } from "src/components/common/Button";
import { ButtonVariant } from "src/components/common/Button";
import { Logo } from "src/components/common/Logo";
import { PageHeader } from "src/components/common/PageHeader";
import { SidebarBox } from "src/components/common/SidebarBox";
import { VerticalList } from "src/components/common/VerticalList";
import { IconMail } from "src/components/icons";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { useConfig } from "src/stores/config";
import { usePageMetadata } from "src/stores/pageMetadata";
import { useUser } from "src/stores/user";

const AdministrationPage = () => {
  const { config } = useConfig();
  const { user } = useUser();
  const administrator = config.administrator;

  usePageMetadata(
    () => ({
      ready: true,
      title: "Administration",
      description: "Contact the TRCustoms.org moderation team.",
    }),
    [],
  );

  const sidebar = (
    <SidebarBox>
      <VerticalList>
        <div className={styles.logo}>
          <Logo />
        </div>
        {administrator && user && user.id !== administrator.id && (
          <Button
            variant={ButtonVariant.Important}
            to={`/users/${administrator.id}/message`}
            icon={<IconMail />}
          >
            Send message
          </Button>
        )}
      </VerticalList>
    </SidebarBox>
  );

  return (
    <SidebarLayout
      header={
        <PageHeader
          header="Administration"
          subheader="TRCustoms.org moderation team"
        />
      }
      sidebar={sidebar}
    >
      <p>
        This account is utilized by multiple TRCustoms.org moderators to manage
        content, enforce rules, and maintain the platform.
      </p>
      <p>You can send a message to:</p>
      <ul>
        <li>Report serious rule violations</li>
        <li>Ask about a moderation decision</li>
        <li>Flag urgent issues affecting the site</li>
        <li>Reach out with other questions or inquiries</li>
      </ul>
      <p>
        If you do not have an active account on the website, you can email us at{" "}
        <a href="mailto:admin@trcustoms.org">admin@trcustoms.org</a>.
      </p>
    </SidebarLayout>
  );
};

export { AdministrationPage };
