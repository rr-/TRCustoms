import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";
import { AwardList } from "src/components/common/AwardList";
import { Button } from "src/components/common/Button";
import { DefinitionItemGroup } from "src/components/common/DefinitionList";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { Link } from "src/components/common/Link";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { UserPictureMode } from "src/components/common/UserPicture";
import { UserPicture } from "src/components/common/UserPicture";
import { IconGlobe } from "src/components/icons";
import { IconHeart } from "src/components/icons";
import type { UserDetails } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface UserSidebarProps {
  user: UserDetails;
}

const UserSidebar = ({ user }: UserSidebarProps) => {
  const navigate = useNavigate();

  const handleLevelCountClick = () => {
    const element = document.querySelector(".Anchor--userAuthoredLevels");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // XXX: should scroll after navigation
      navigate(`/users/${user.id}`);
    }
  };

  const handleReviewCountClick = () => {
    const element = document.querySelector(".Anchor--userReviewedLevels");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // XXX: should scroll after navigation
      navigate(`/users/${user.id}`);
    }
  };

  return (
    <SidebarBox
      header={<UserPicture user={user} mode={UserPictureMode.Full} />}
      actions={
        <>
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
        </>
      }
    >
      <DefinitionList>
        <DefinitionItemGroup>
          <DefinitionItem span={true}>
            <SectionHeader>Details</SectionHeader>
          </DefinitionItem>

          <DefinitionItem term="Joined">
            {formatDate(user.date_joined) || "Unknown"}
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
            <Link onClick={handleLevelCountClick}>
              {user.authored_level_count}
            </Link>
          </DefinitionItem>

          <DefinitionItem term="Reviews posted">
            <Link onClick={handleReviewCountClick}>
              {user.reviewed_level_count}
            </Link>
          </DefinitionItem>

          <DefinitionItem term="Walkthroughs">
            <Link to={`/users/${user.id}/walkthroughs`}>
              {user.authored_walkthrough_count}
            </Link>
          </DefinitionItem>

          <DefinitionItem term="Levels played">
            <Link to={`/users/${user.id}/playlist`}>
              {user.played_level_count}
            </Link>
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
    </SidebarBox>
  );
};

export { UserSidebar };
