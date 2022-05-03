import "./HomePage.css";
import { useContext } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { FeaturedLevelsView } from "src/components/FeaturedLevelsView";
import { NewsList } from "src/components/NewsList";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { ReviewStats } from "src/components/ReviewStats";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { WalkthroughStats } from "src/components/WalkthroughStats";
import { IconDiscord } from "src/components/icons";
import { IconGitHub } from "src/components/icons";
import { IconKofi } from "src/components/icons";
import { IconTwitter } from "src/components/icons";
import { EngineLink } from "src/components/links/EngineLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { TitleContext } from "src/contexts/TitleContext";
import { UserPermission } from "src/services/UserService";
import { reprBigNumber } from "src/utils/string";

const LevelStats = () => {
  const { config } = useContext(ConfigContext);

  return (
    <DefinitionList>
      <DefinitionItem term={<Link to="/levels">Total levels</Link>}>
        {config.total_levels}
      </DefinitionItem>

      <DefinitionItemGroup className="LevelStats--engines">
        {config.engines.map((engine) => (
          <DefinitionItem key={engine.id} term={<EngineLink engine={engine} />}>
            {engine.level_count}
          </DefinitionItem>
        ))}
      </DefinitionItemGroup>

      <DefinitionItem term="Downloads">
        {reprBigNumber(config.total_downloads)} (
        {reprBigNumber(config.total_downloads / config.total_levels)} per level)
      </DefinitionItem>
    </DefinitionList>
  );
};

const HomePage = () => {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("");
  }, [setTitle]);

  return (
    <div className="HomePage">
      <div className="HomePage--featuredLevels">
        <FeaturedLevelsView />
      </div>
      <aside className="HomePage--sidebar">
        <SidebarBox
          actions={
            <PermissionGuard require={UserPermission.editNews}>
              <PushButton to={`/news`}>Add news</PushButton>
            </PermissionGuard>
          }
        >
          <SectionHeader>Statistics</SectionHeader>
          <LevelStats />
          <ReviewStats />
          <WalkthroughStats />

          <Section>
            <SectionHeader>External links</SectionHeader>

            <div className="HomePageExtraButtons">
              <PushButton
                isPlain={true}
                className="HomePage--supportButton"
                icon={<IconDiscord />}
                to="https://discord.gg/qxpHsYKeKz"
              >
                Join our Discord
              </PushButton>

              <PushButton
                isPlain={true}
                className="HomePage--supportButton"
                icon={<IconTwitter />}
                to="https://twitter.com/trcustomsorg"
              >
                Follow us on Twitter
              </PushButton>

              <PushButton
                isPlain={true}
                className="HomePage--supportButton"
                icon={<IconKofi />}
                to="https://ko-fi.com/trcustomsorg"
              >
                Support us on Ko-fi
              </PushButton>

              <PushButton
                isPlain={true}
                className="HomePage--supportButton"
                icon={<IconGitHub />}
                to="https://github.com/rr-/trcustoms/issues"
              >
                Report a bug
              </PushButton>
            </div>
          </Section>
        </SidebarBox>
      </aside>
      <div className="HomePage--main">
        <Section>
          <SectionHeader>News</SectionHeader>
          <NewsList />
        </Section>
      </div>
    </div>
  );
};

export { HomePage };
