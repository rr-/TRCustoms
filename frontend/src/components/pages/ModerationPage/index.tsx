import { useState } from "react";
import { AuditLogSearch } from "src/components/common/AuditLogSearch";
import { VerticalList } from "src/components/common/VerticalList";
import { AuditLogTable } from "src/components/common/AuditLogTable";
import { Button } from "src/components/common/Button";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PageGuard } from "src/components/common/PermissionGuard";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";
import { UserPermission } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: AuditLogSearchQuery = {
  isActionRequired: null,
  page: null,
  sort: "-created",
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): AuditLogSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  isActionRequired: qp.action_required === "1" ? true : null,
  userSearch: qp.user,
  objectSearch: qp.obj,
});

const serializeSearchQuery = (
  searchQuery: AuditLogSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    user: searchQuery.userSearch,
    obj: searchQuery.objectSearch,
    action_required: searchQuery.isActionRequired === true ? "1" : null,
  });

const ModerationPageView = () => {
  const [searchQuery, setSearchQuery] = useState<AuditLogSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Moderate",
      description: "A page for managing and monitoring user actions.",
    }),
    []
  );

  const header = <VerticalList>
    <Button to={"/mod/how-to"} disableTimeout={true}>
      Moderating guidelines
    </Button>
    <Button to={"/users"} disableTimeout={true}>
      User list
    </Button>
  </VerticalList>;

  const sidebar = (
    <SidebarBox header={ header } >
      <AuditLogSearch
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </SidebarBox>
  );

  return (
    <SidebarLayout sidebar={sidebar}>
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <InfoMessage type={InfoMessageType.Info}>
        The log contains recent changes made by all users. All these changes are
        already live.
        <br />
        New levels and users can be approved on their individual pages.
      </InfoMessage>

      <SectionHeader>Recent actions</SectionHeader>
      <AuditLogTable
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </SidebarLayout>
  );
};

const ModerationPage = () => {
  return (
    <PageGuard require={UserPermission.reviewAuditLogs}>
      <ModerationPageView />
    </PageGuard>
  );
};

export { ModerationPage };
