import styles from "./index.module.css";
import { AwardList } from "src/components/common/AwardList";
import { Button } from "src/components/common/Button";
import { DefinitionItemGroup } from "src/components/common/DefinitionList";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { UserPictureMode } from "src/components/common/UserPicture";
import { UserPicture } from "src/components/common/UserPicture";
import { VerticalList } from "src/components/common/VerticalList";
import { IconGlobe } from "src/components/icons";
import { IconHeart } from "src/components/icons";
import type { UserDetails } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface UserSidebarProps {
  user: UserDetails;
}

const UserSidebar = ({ user }: UserSidebarProps) => {
  const isUserFromTrle = user.trle_reviewer_id || user.trle_author_id;
  const showJoinDate = !isUserFromTrle || user.last_login;

  const header = (
    <VerticalList gap="big">
      <VerticalList>
        <UserPicture user={user} mode={UserPictureMode.Full} />

        {user.website_url && (
          <Button to={user.website_url} icon={<IconGlobe />}>
            Website
          </Button>
        )}
        {user.donation_url && (
          <Button to={user.donation_url} icon={<IconHeart />}>
            Donate
          </Button>
        )}
      </VerticalList>
    </VerticalList>
  );

  const userProperties = (
    <DefinitionList>
      <DefinitionItemGroup>
        <DefinitionItem span={true}>
          <SectionHeader>Details</SectionHeader>
        </DefinitionItem>

        <DefinitionItem term="Joined">
          {showJoinDate && user.date_joined
            ? formatDate(user.date_joined)
            : "Unknown"}
        </DefinitionItem>

        <DefinitionItem term="Country">
          {user.country?.name || "Unknown"}
        </DefinitionItem>

        {!!(user.trle_reviewer_id || user.trle_author_id) && (
          <DefinitionItem term="Links">
            <div className={styles.links}>
              {user.trle_reviewer_id && (
                <a
                  href={`https://www.trle.net/sc/reviewerfeatures.php?rid=${user.trle_reviewer_id}`}
                >
                  TRLE.net (reviewer)
                </a>
              )}
              {user.trle_author_id && (
                <a
                  href={`https://www.trle.net/sc/authorfeatures.php?aid=${user.trle_author_id}`}
                >
                  TRLE.net (author)
                </a>
              )}
            </div>
          </DefinitionItem>
        )}
      </DefinitionItemGroup>

      <DefinitionItemGroup>
        <DefinitionItem span={true}>
          <SectionHeader>Library</SectionHeader>
        </DefinitionItem>

        <DefinitionItem term="Levels authored">
          {user.authored_level_count_approved}
        </DefinitionItem>

        <DefinitionItem term="Reviews posted">
          {user.reviewed_level_count}
        </DefinitionItem>

        <DefinitionItem term="Walkthroughs">
          {user.authored_walkthrough_count_all}
        </DefinitionItem>

        <DefinitionItem term="Levels played">
          {user.played_level_count}
        </DefinitionItem>
      </DefinitionItemGroup>

      {user.awards.length ? (
        <DefinitionItemGroup>
          <DefinitionItem span={true}>
            <SectionHeader>Inventory</SectionHeader>
          </DefinitionItem>

          <DefinitionItem span={true}>
            <AwardList awards={user.awards} />
          </DefinitionItem>
        </DefinitionItemGroup>
      ) : null}
    </DefinitionList>
  );

  return (
    <div className={styles.wrapper}>
      <SidebarBox
        header={<div className={styles.potentialColumn}>{header}</div>}
      >
        <div className={styles.potentialColumn}>{userProperties}</div>
      </SidebarBox>
    </div>
  );
};

export { UserSidebar };
