import styles from "./index.module.css";
import { useState, useEffect } from "react";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { UserPicLink } from "src/components/links/UserPicLink";
import { BaseModal } from "src/components/modals/BaseModal";
import type {
  AwardRecipient,
  AwardRecipientsSearchQuery,
} from "src/services/AwardService";
import { AwardService } from "src/services/AwardService";
import { formatDate } from "src/utils/string";

interface AwardRecipientsModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  code: string;
  tier?: number;
}

const AwardRecipientsModal = ({
  isActive,
  onIsActiveChange,
  code,
  tier,
}: AwardRecipientsModalProps) => {
  const [searchQuery, setSearchQuery] = useState<AwardRecipientsSearchQuery>({
    code,
    tier,
    page: 1,
  });

  useEffect(() => {
    if (isActive) {
      setSearchQuery({ code, tier, page: 1 });
    }
  }, [isActive, code, tier]);

  const columns: DataTableColumn<AwardRecipient>[] = [
    {
      name: "user",
      label: "User",
      itemElement: ({ item }) => <UserPicLink user={item.user} />,
    },
    {
      name: "created",
      label: "Award date",
      itemElement: ({ item }) => formatDate(item.created),
    },
  ];

  if (!isActive) {
    return <></>;
  }

  return (
    <BaseModal
      title="Users who got this award"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
    >
      <div className={styles.tableWrapper}>
        <DataTable
          className={styles.table}
          queryName={`awardRecipients-${code}-${tier ?? ""}`}
          columns={columns}
          itemKey={(item) => `${item.user.id}`}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchFunc={AwardService.searchAwardRecipients}
        />
      </div>
    </BaseModal>
  );
};

export { AwardRecipientsModal };
