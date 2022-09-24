import styles from "./index.module.css";
import { PushButton } from "src/components/common/PushButton";
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
          <PushButton
            isPlain={true}
            icon={<IconDiscord />}
            to="https://discord.gg/qxpHsYKeKz"
          >
            Join our Discord
          </PushButton>

          <PushButton
            isPlain={true}
            icon={<IconTwitter />}
            to="https://twitter.com/trcustomsorg"
          >
            Follow us on Twitter
          </PushButton>

          <PushButton
            isPlain={true}
            icon={<IconKofi />}
            to="https://ko-fi.com/trcustomsorg"
          >
            Support us on Ko-fi
          </PushButton>

          <PushButton
            isPlain={true}
            icon={<IconGitHub />}
            to="https://github.com/rr-/trcustoms/issues"
          >
            Report a bug
          </PushButton>
        </div>
      </Section>
    </SidebarBox>
  );
};

export { StatsSidebar };
