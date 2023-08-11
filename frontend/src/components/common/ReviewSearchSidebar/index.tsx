import { GFXCard } from "src/components/common/GFXCard";
import { Link } from "src/components/common/Link";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";

const ReviewSearchSidebar = () => {
  return (
    <SidebarBox>
      <Section>
        <SectionHeader>Reviewer lounge</SectionHeader>

        <Link to={`/reviews/authors`}>
          <GFXCard name="reviewer_catalogue" variant="big">
            Reviewer catalogue
          </GFXCard>
        </Link>

        <Link to={`/reviews/level_suggestions`}>
          <GFXCard name="least_reviewed_levels" variant="big">
            Less known levels
          </GFXCard>
        </Link>
      </Section>
    </SidebarBox>
  );
};

export { ReviewSearchSidebar };
