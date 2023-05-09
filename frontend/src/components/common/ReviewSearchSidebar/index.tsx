import { GFXCard } from "src/components/common/GFXCard";
import { Link } from "src/components/common/Link";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";

const ReviewSearchSidebar = () => {
  return (
    <SidebarBox>
      <Section className="ChildMarginClear">
        <SectionHeader>Reviewer catalogue</SectionHeader>
        <Link to={`/reviews/authors`}>
          <GFXCard name="reviewer_catalogue" variant="big">
            Reviewer catalogue
          </GFXCard>
        </Link>
      </Section>

      <Section className="ChildMarginClear">
        <SectionHeader>Least reviewed levels</SectionHeader>
        <Link to={`/reviews/level_suggestions`}>
          <GFXCard name="least_reviewed_levels" variant="big">
            Less known levels
          </GFXCard>
        </Link>
        <p>
          A list of levels with less than 5 reviews, sorted by the oldest
          release date.
        </p>
      </Section>
    </SidebarBox>
  );
};

export { ReviewSearchSidebar };
