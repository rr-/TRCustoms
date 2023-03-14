import styles from "./index.module.css";
import { sortBy } from "lodash";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { AwardModal } from "src/components/modals/AwardModal";
import type { UserAward } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface AwardListProps {
  awards: UserAward[];
}

interface AwardListItemProps {
  award: UserAward;
}

const AwardListItem = ({ award }: AwardListItemProps) => {
  const [isModalActive, setIsModalActive] = useState(false);

  const onLinkClick = () => {
    setIsModalActive(true);
  };

  return (
    <>
      <AwardModal
        award={award}
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
      />
      <Link onClick={() => onLinkClick()}>
        <img
          className={styles.image}
          src={UserService.getAwardImageUrl(award)}
          title={UserService.getAwardTitle(award)}
          alt={UserService.getAwardTitle(award)}
        />
      </Link>
    </>
  );
};

const AwardList = ({ awards }: AwardListProps) => {
  return (
    <ul className={`${styles.list} ChildMarginClear`}>
      {sortBy(awards, (award) => award.position).map(
        (award: UserAward, i: number) => (
          <li key={`${i}`} className={styles.listItem}>
            <AwardListItem award={award} />
          </li>
        )
      )}
    </ul>
  );
};

export { AwardList };
