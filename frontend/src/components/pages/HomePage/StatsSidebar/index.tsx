import styles from "./index.module.css";
import { Link } from "src/components/common/Link";
import { RatingStats } from "src/components/common/RatingStats";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { WalkthroughStats } from "src/components/common/WalkthroughStats";
import { IconDiscord } from "src/components/icons";
import { IconGitHub } from "src/components/icons";
import { IconKofi } from "src/components/icons";
import { IconTwitter } from "src/components/icons";
import { IconReddit } from "src/components/icons";
import { IconSocials } from "src/components/icons";
import { LevelStats } from "src/components/pages/HomePage/LevelStats";

const StatsSidebar = () => {
  return (
    <SidebarBox>
      <Section>
        <SectionHeader>Statistics</SectionHeader>
        <LevelStats />
        <RatingStats />
        <WalkthroughStats />
      </Section>

      <Section>
        <SectionHeader>External links</SectionHeader>

        <div className={styles.extraButtons}>
          <Link icon={<IconDiscord />} to="https://discord.gg/qxpHsYKeKz">
            Join our Discord
          </Link>

          <Link icon={<IconSocials />} to="https://linktr.ee/trcustomsorg">
            Follow our socials
          </Link>

          <Link icon={<IconReddit />} to="https://www.reddit.com/r/trle/">
            Browse the TRLE subreddit
          </Link>

          <Link icon={<IconKofi />} to="https://ko-fi.com/trcustomsorg">
            Support us on Ko-fi
          </Link>

          <Link
            icon={<IconGitHub />}
            to="https://github.com/rr-/trcustoms/issues"
          >
            Report a bug
          </Link>
        </div>
      </Section>
    </SidebarBox>
  );
};

export { StatsSidebar };
