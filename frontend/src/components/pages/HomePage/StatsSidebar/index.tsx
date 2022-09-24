import styles from "./index.module.css";
import { Button } from "src/components/common/Button";
import { ReviewStats } from "src/components/common/ReviewStats";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { WalkthroughStats } from "src/components/common/WalkthroughStats";
import { IconDiscord } from "src/components/icons";
import { IconGitHub } from "src/components/icons";
import { IconKofi } from "src/components/icons";
import { IconTwitter } from "src/components/icons";
import { LevelStats } from "src/components/pages/HomePage/LevelStats";

const StatsSidebar = () => {
  return (
    <SidebarBox>
      <SectionHeader>Statistics</SectionHeader>
      <LevelStats />
      <ReviewStats />
      <WalkthroughStats />

      <Section>
        <SectionHeader>External links</SectionHeader>

        <div className={styles.extraButtons}>
          <Button
            isPlain={true}
            icon={<IconDiscord />}
            to="https://discord.gg/qxpHsYKeKz"
          >
            Join our Discord
          </Button>

          <Button
            isPlain={true}
            icon={<IconTwitter />}
            to="https://twitter.com/trcustomsorg"
          >
            Follow us on Twitter
          </Button>

          <Button
            isPlain={true}
            icon={<IconKofi />}
            to="https://ko-fi.com/trcustomsorg"
          >
            Support us on Ko-fi
          </Button>

          <Button
            isPlain={true}
            icon={<IconGitHub />}
            to="https://github.com/rr-/trcustoms/issues"
          >
            Report a bug
          </Button>
        </div>
      </Section>
    </SidebarBox>
  );
};

export { StatsSidebar };
