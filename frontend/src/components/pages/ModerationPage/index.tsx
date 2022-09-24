import "./index.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { AuditLogSearch } from "src/components/common/AuditLogSearch";
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
import { TitleContext } from "src/contexts/TitleContext";
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
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<AuditLogSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Moderate");
  }, [setTitle]);

  return (
    <div className="ModerationPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="ModerationPage--sidebar">
        <SidebarBox
          actions={
            <>
              <Button to={"/mod/how-to"} disableTimeout={true}>
                Moderating guidelines
              </Button>
              <Button to={"/users"} disableTimeout={true}>
                User list
              </Button>
            </>
          }
        >
          <AuditLogSearch
            defaultSearchQuery={defaultSearchQuery}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </SidebarBox>
      </div>

      <div className="ModerationPage--results ChildMarginClear">
        <InfoMessage type={InfoMessageType.Info}>
          The log contains recent changes made by all users. All these changes
          are already live.
          <br />
          New levels and users can be approved on their individual pages.
        </InfoMessage>

        <SectionHeader>Recent actions</SectionHeader>
        <AuditLogTable
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
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
