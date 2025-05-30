import styles from "./index.module.css";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { DefaultNoItemsElement } from "src/components/common/DataList";
import { EventSidebar } from "src/components/common/EventSidebar";
import { LevelView } from "src/components/common/LevelList";
import { Loader } from "src/components/common/Loader";
import { PageHeader } from "src/components/common/PageHeader";
import { Section, SectionHeader } from "src/components/common/Section";
import { SmartWrap } from "src/components/common/SmartWrap";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { SidebarLayoutVariant } from "src/components/layouts/SidebarLayout";
import { Markdown } from "src/components/markdown/Markdown";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { EventDetails } from "src/services/EventService";
import { EventService } from "src/services/EventService";

interface EventPageParams {
  eventId: string;
}

const EventPage = () => {
  const { eventId } = useParams() as EventPageParams;
  const result = useQuery<EventDetails, Error>(
    ["event", EventService.getEventById, eventId],
    async () => EventService.getEventById(Number(eventId)),
  );

  const event = result.data;
  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: event?.name || "Community event",
      description: event?.subtitle || "",
      image: event?.cover_image?.url || undefined,
    }),
    [result],
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }
  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const fullTitle =
    event?.name && event?.subtitle
      ? `${event.name} - ${event.subtitle}`
      : event?.name
        ? event?.name
        : "Community event";
  return (
    <SidebarLayout
      variant={SidebarLayoutVariant.Normal}
      sidebar={<EventSidebar event={event} />}
      header={<PageHeader header={<SmartWrap text={fullTitle} />} />}
    >
      <Section>
        <SectionHeader>About</SectionHeader>
        <div className={styles.mainText}>
          <Markdown>{event.about || "No description available."}</Markdown>
        </div>
      </Section>

      {event.levels.length > 0 && (
        <Section>
          <SectionHeader>Level Collection</SectionHeader>
          {event.levels.map((level) => (
            <LevelView key={level.id} level={level} />
          ))}
        </Section>
      )}
    </SidebarLayout>
  );
};

export { EventPage };
