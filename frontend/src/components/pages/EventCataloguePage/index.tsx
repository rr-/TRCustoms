import styles from "./index.module.css";
import { range } from "lodash";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ButtonVariant } from "src/components/common/Button";
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
import { SubmitButton } from "src/components/formfields/SubmitButton";
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
              alt={EventService.getFullTitle(event)}
            />
          </Link>
        </div>
      )}
      <h3 className={styles.title}>
        <Link to={`/extras/event/${event.id}`}>
          {EventService.getFullTitle(event)}
        </Link>
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

  const currentYear = new Date().getFullYear();
  const yearOptions: DropdownOption[] = range(1999, currentYear + 1)
    .map((year) => ({ value: year, label: `${year}` }))
    .reverse();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchParam = searchParams.get("search") || "";
  const initialYearParam = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;

  const [formSearch, setFormSearch] = useState<string>(initialSearchParam);
  const [formYear, setFormYear] = useState<number | undefined>(
    initialYearParam,
  );

  const [searchQuery, setSearchQuery] = useState<EventSearchQuery>({
    page: null,
    sort: "-collection_release",
    search: initialSearchParam || null,
    year: initialYearParam,
  });

  const handleFormSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormSearch(e.target.value);
  };

  const handleFormYearChange = (value: unknown) => {
    setFormYear(value === "" ? undefined : Number(value));
  };

  const applySearch = useCallback(() => {
    const newSearch = formSearch.trim() || null;
    const newYear = formYear;
    const params: Record<string, string> = {};
    if (newSearch) {
      params.search = newSearch;
    }
    if (newYear !== undefined) {
      params.year = String(newYear);
    }
    setSearchParams(params, { replace: true });
    setSearchQuery((prev) => ({
      ...prev,
      search: newSearch,
      year: newYear,
      page: null,
    }));
  }, [formSearch, formYear, setSearchParams]);

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Event catalogue</SectionHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <FormGrid gridType={FormGridType.Row}>
            <FormGridFieldSet>
              <TextInput
                placeholder="Search events..."
                value={formSearch}
                onChange={handleFormSearchChange}
              />
            </FormGridFieldSet>

            <FormGridFieldSet>
              <Dropdown
                allowNull
                nullLabel="Any year"
                options={yearOptions}
                value={formYear ?? ""}
                onChange={handleFormYearChange}
              />
            </FormGridFieldSet>

            <FormGridFieldSet>
              <SubmitButton variant={ButtonVariant.Important}>
                Search
              </SubmitButton>
            </FormGridFieldSet>
          </FormGrid>
        </form>
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
