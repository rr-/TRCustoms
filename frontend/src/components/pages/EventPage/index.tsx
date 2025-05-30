import styles from "./index.module.css";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Box } from "src/components/common/Box";
import { DefaultNoItemsElement } from "src/components/common/DataList";
import { EventSidebar } from "src/components/common/EventSidebar";
import { LevelView } from "src/components/common/LevelList";
import { Loader } from "src/components/common/Loader";
import { Section, SectionHeader } from "src/components/common/Section";
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

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.name || "Community event",
      description: result.data?.subtitle || "",
      image: result.data?.cover_image?.url || undefined,
    }),
    [result],
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }
  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const event = result.data;

  return (
    <SidebarLayout
      variant={SidebarLayoutVariant.Normal}
      sidebar={<EventSidebar event={event} />}
    >
      <Box>
        <SectionHeader>About</SectionHeader>
        <div className={styles.mainText}>
          <Markdown>{event.about || "No description available."}</Markdown>
        </div>
      </Box>

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
