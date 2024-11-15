import styles from "./index.module.css";
import { useState } from "react";
import { RatingDeleteButton } from "src/components/buttons/RatingDeleteButton";
import { RatingEditButton } from "src/components/buttons/RatingEditButton";
import { BurgerMenu } from "src/components/common/BurgerMenu";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserPicture } from "src/components/common/UserPicture";
import { IconThumbUp } from "src/components/icons";
import { IconThumbDown } from "src/components/icons";
import { IconDotsCircleHorizontal } from "src/components/icons";
import { LevelLink } from "src/components/links/LevelLink";
import { UserLink } from "src/components/links/UserLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { RatingListing } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

const rating_EXCERPT_CUTOFF = 1200;

interface RatingsListItemProps {
  rating: RatingListing;
}

const RatingsListItem = ({ rating }: RatingsListItemProps) => {
  const [isExcerptExpanded, setIsExcerptExpanded] = useState(false);
  const classNames = [styles.wrapper];

  const position = rating.rating_class?.position || 0;
  let badge: React.ReactNode;
  if (position > 0) {
    classNames.push(styles.positive);
    badge = (
      <>
        <IconThumbUp />
        Positive
      </>
    );
  } else if (position < 0) {
    classNames.push(styles.negative);
    badge = (
      <>
        <IconThumbDown />
        Negative
      </>
    );
  } else {
    classNames.push(styles.neutral);
    badge = (
      <>
        <IconDotsCircleHorizontal />
        Neutral
      </>
    );
  }

  const handleReadMoreClick = () => {
    setIsExcerptExpanded((isExcerptExpanded) => !isExcerptExpanded);
  };

  const header = (
    <header className={styles.header}>
      <div className={styles.info}>
        <div className={styles.userInfo}>
          <UserLink className={styles.userLink} user={rating.author}>
            <div className={styles.userPic}>
              <UserPicture user={rating.author} />
            </div>
          </UserLink>
          <div>
            <UserLink className={styles.userLink} user={rating.author}>
              {rating.author.username}
            </UserLink>
            <br />
            <small>Ratings posted: {rating.author.rated_level_count}</small>
          </div>
        </div>
      </div>

      {<div className={styles.badge}>{badge}</div>}

      {formatDate(rating.created) !==
        formatDate(rating.last_user_content_updated) && (
        <small>
          Updated on: {formatDate(rating.last_user_content_updated)}
        </small>
      )}

      <small>Posted on: {formatDate(rating.created)}</small>

      <BurgerMenu>
        <PermissionGuard
          require={UserPermission.editRatings}
          owningUsers={[rating.author]}
        >
          <RatingEditButton rating={rating} />
        </PermissionGuard>
        <PermissionGuard require={UserPermission.deleteRatings}>
          <RatingDeleteButton rating={rating} />
        </PermissionGuard>
      </BurgerMenu>
    </header>
  );

  return <div className={classNames.join(" ")}>{header}</div>;
};

export { RatingsListItem };
