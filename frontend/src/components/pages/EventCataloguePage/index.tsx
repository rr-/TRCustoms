import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const EventCataloguePage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Event catalogue",
      description: "Browse the event catalogue.",
      image: "card-event_catalogue.jpg",
    }),
    [],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Event catalogue</SectionHeader>
        <p>Dummy content for the Event catalogue.</p>
      </Section>
    </SidebarLayout>
  );
};

export { EventCataloguePage };
