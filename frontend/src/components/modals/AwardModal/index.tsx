import styles from "./index.module.css";
import AwardRarityBar from "src/components/common/AwardRarityBar";
import { BaseModal } from "src/components/modals/BaseModal";
import type { UserAward } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { reprPercentage } from "src/utils/string";
import { formatDate } from "src/utils/string";

interface AwardModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  award: UserAward;
}

const AwardModal = ({ isActive, onIsActiveChange, award }: AwardModalProps) => {
  return (
    <BaseModal
      title="Item details"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
    >
      <div className={styles.container}>
        <img
          className={styles.image}
          src={UserService.getAwardImageUrl(award)}
          title={UserService.getAwardTitle(award)}
          alt={UserService.getAwardTitle(award)}
        />
        <h1 className={styles.header}>{UserService.getAwardTitle(award)}</h1>
        <p>{award.description}</p>
        <p>Awarded on {formatDate(award.last_updated ?? award.created)}.</p>
        <AwardRarityBar userPercentage={award.user_percentage} />
      </div>
    </BaseModal>
  );
};

export { AwardModal };
