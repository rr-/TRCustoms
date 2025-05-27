import { GFXCard } from "src/components/common/GFXCard";
import { Link } from "src/components/common/Link";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";

const ExtrasSidebar = () => {
  return (
    <SidebarBox>
      <Section>
        <SectionHeader>Extras</SectionHeader>

        <Link to={`/extras/treasure_vault`}>
          <GFXCard name="treasure_vault" variant="big">
            Treasure vault
          </GFXCard>
        </Link>

        <Link to={`/extras/event_catalogue`}>
          <GFXCard name="event_catalogue" variant="big">
            Event catalogue
          </GFXCard>
        </Link>

        <Link to={`/extras/user_finder`}>
          <GFXCard name="user_finder" variant="big">
            User finder
          </GFXCard>
        </Link>
      </Section>
    </SidebarBox>
  );
};

export { ExtrasSidebar };
