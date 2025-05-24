import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const BuilderLocationsPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Builder locations",
      description: "Find builder locations.",
      image: "card-builder_locations.jpg",
    }),
    [],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Builder locations</SectionHeader>
        <p>Dummy content for the Builder locations.</p>
      </Section>
    </SidebarLayout>
  );
};

export { BuilderLocationsPage };
