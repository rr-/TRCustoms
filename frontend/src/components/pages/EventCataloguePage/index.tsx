import styles from "./index.module.css";
import { range } from "lodash";
import { useState, useCallback } from "react";
import { Card, CardList } from "src/components/common/Card";
import { DataList } from "src/components/common/DataList";
import { Dropdown, type DropdownOption } from "src/components/common/Dropdown";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import {
  FormGrid,
  FormGridFieldSet,
  FormGridType,
} from "src/components/common/FormGrid";
import { Link } from "src/components/common/Link";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { TextInput } from "src/components/common/TextInput";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import {
  EventService,
  type EventSearchQuery,
  type EventListing,
} from "src/services/EventService";

interface EventViewProps {
  event: EventListing;
}

const EventView = ({ event }: EventViewProps) => {
  return (
    <Card key={event.id} className={styles.card}>
      {event.cover_image?.url && (
        <div className={styles.coverImageWrapper}>
          <Link to={`/extras/event/${event.id}`}>
            <img
              className={styles.coverImage}
              src={event.cover_image.url}
              alt={event.name}
            />
          </Link>
        </div>
      )}
      <h3 className={styles.title}>
        <Link to={`/extras/event/${event.id}`}>{event.name}</Link>
      </h3>
      {event.year && <div>{event.year}</div>}
      {event.level_count != null && <div>{event.level_count} levels</div>}
    </Card>
  );
};

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

  const [searchQuery, setSearchQuery] = useState<EventSearchQuery>({
    page: null,
    sort: "-collection_release",
    search: null,
    year: undefined,
  });

  const currentYear = new Date().getFullYear();
  const yearOptions: DropdownOption[] = range(1999, currentYear + 1)
    .map((year) => ({ value: year, label: `${year}` }))
    .reverse();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchQuery({
        ...searchQuery,
        search: e.target.value || null,
        page: null,
      }),
    [searchQuery],
  );

  const handleYearChange = useCallback(
    (value: unknown) =>
      setSearchQuery({
        ...searchQuery,
        year: value === "" ? undefined : Number(value),
        page: null,
      }),
    [searchQuery],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Event catalogue</SectionHeader>

        <FormGrid gridType={FormGridType.Row}>
          <FormGridFieldSet>
            <TextInput
              placeholder="Search events..."
              value={searchQuery.search || ""}
              onChange={handleSearchChange}
            />
          </FormGridFieldSet>

          <FormGridFieldSet>
            <Dropdown
              allowNull
              nullLabel="Any year"
              options={yearOptions}
              value={searchQuery.year ?? ""}
              onChange={handleYearChange}
            />
          </FormGridFieldSet>
        </FormGrid>
      </Section>

      <Section>
        <DataList
          queryName="events"
          itemKey={(event: EventListing) => `${event.id}`}
          itemView={(event: EventListing) => (
            <EventView key={event.id} event={event} />
          )}
          pageView={(children) => <CardList>{children}</CardList>}
          searchQuery={searchQuery}
          searchFunc={EventService.searchEvents}
          onSearchQueryChange={setSearchQuery}
        />
      </Section>
    </SidebarLayout>
  );
};

export { EventCataloguePage };
