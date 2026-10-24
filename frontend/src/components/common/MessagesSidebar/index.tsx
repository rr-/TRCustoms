import styles from "./index.module.css";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "src/components/common/Link";
import { MessageSettings } from "src/components/common/MessagesSidebar/MessageSettings";
import { hasPermission } from "src/components/common/PermissionGuard";
import type { SerializedQuery } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { Radioboxes } from "src/components/common/Radioboxes";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import { SidebarBox } from "src/components/common/SidebarBox";
import { Form } from "src/components/forms/Form";
import { SubmitButton } from "src/components/forms/SubmitButton";
import { TextField } from "src/components/forms/fields/TextField";
import { IconSearch } from "src/components/icons";
import type { ThreadSearchQuery } from "src/services/MessageService";
import { UserPermission } from "src/services/UserService";
import { useUser } from "src/stores/user";
import { filterFalsyObjectValues } from "src/utils/misc";

const defaultThreadSearchQuery: ThreadSearchQuery = {
  page: null,
  search: null,
  asAdministrator: false,
};

const deserializeThreadSearchQuery = (qp: {
  [key: string]: string;
}): ThreadSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultThreadSearchQuery),
  asAdministrator: qp.mailbox === "administration",
});

const serializeThreadSearchQuery = (
  searchQuery: ThreadSearchQuery,
): SerializedQuery =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultThreadSearchQuery),
    mailbox: searchQuery.asAdministrator ? "administration" : null,
  });

const threadSearchUrl = (searchQuery: ThreadSearchQuery) => {
  const params = new URLSearchParams(
    Object.entries(serializeThreadSearchQuery(searchQuery)).map(
      ([key, value]) => [key, String(value)],
    ),
  ).toString();
  return params ? `/messages?${params}` : "/messages";
};

const mailboxOptions = [
  { id: false, name: "Mine" },
  { id: true, name: "Administration" },
];

interface MessagesSidebarProps {
  searchQuery: ThreadSearchQuery;
  onSearchQueryChange: (searchQuery: ThreadSearchQuery) => void;
}

const MessagesSidebar = ({
  searchQuery,
  onSearchQueryChange,
}: MessagesSidebarProps) => {
  const { user } = useUser();
  const form = useForm({
    defaultValues: { search: searchQuery.search || "" },
  });

  const { reset } = form;
  useEffect(
    () => reset({ search: searchQuery.search || "" }),
    [searchQuery, reset],
  );

  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      search: values.search || null,
    });
  });

  return (
    <SidebarBox>
      <Form form={form} onSubmit={submit} className={styles.wrapper}>
        <SidebarBoxHeader alignToTabSwitch={false}>
          <span className={styles.header}>
            Filter messages
            <Link
              className={styles.resetButton}
              onClick={() =>
                onSearchQueryChange({
                  ...defaultThreadSearchQuery,
                  asAdministrator: searchQuery.asAdministrator,
                })
              }
            >
              (reset)
            </Link>
          </span>
        </SidebarBoxHeader>

        <div className={`${styles.section} ${styles.searchBar}`}>
          <TextField label="Search" name="search" />
          <div className="FormField">
            <SubmitButton icon={<IconSearch />} />
          </div>
        </div>

        {hasPermission(user, UserPermission.messageAsAdministrator) && (
          <div className={styles.section}>
            <Radioboxes
              header="Mailbox"
              options={mailboxOptions}
              value={!!searchQuery.asAdministrator}
              onChange={(asAdministrator) =>
                onSearchQueryChange({
                  ...defaultThreadSearchQuery,
                  asAdministrator,
                })
              }
              getOptionId={(option) => option.id}
              getOptionName={(option) => option.name}
            />
          </div>
        )}
      </Form>

      <MessageSettings />
    </SidebarBox>
  );
};

export {
  MessagesSidebar,
  defaultThreadSearchQuery,
  deserializeThreadSearchQuery,
  threadSearchUrl,
};
