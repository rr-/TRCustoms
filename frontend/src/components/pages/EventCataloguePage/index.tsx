import styles from "./index.module.css";
import { range } from "lodash";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { ButtonVariant } from "src/components/common/Button";
import { Card, CardList } from "src/components/common/Card";
import { DataList } from "src/components/common/DataList";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import {
  FormGrid,
  FormGridFieldSet,
  FormGridType,
} from "src/components/common/FormGrid";
import { Link } from "src/components/common/Link";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { DropDownField } from "src/components/forms/DropDownField";
import { Form } from "src/components/forms/Form";
import { TextField } from "src/components/forms/TextField";
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
          {event.year && <> ({event.year})</>}
        </Link>
      </h3>
      {event.level_count != null && (
        <small>Includes {event.level_count} levels</small>
      )}
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
  const yearOptions = range(1999, currentYear + 1)
    .map((year) => ({ value: year, label: `${year}` }))
    .reverse();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchParam = searchParams.get("search") || "";
  const initialYearParam = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;

  const form = useForm({
    defaultValues: {
      search: initialSearchParam,
      year: initialYearParam != null ? String(initialYearParam) : "",
    },
  });

  const [searchQuery, setSearchQuery] = useState<EventSearchQuery>({
    page: null,
    sort: "-collection_release",
    search: initialSearchParam || null,
    year: initialYearParam,
  });

  const submit = form.handleSubmit((values) => {
    const newSearch = values.search.trim() || null;
    const newYear = values.year ? Number(values.year) : undefined;
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
  });

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Event catalogue</SectionHeader>

        <Form form={form} onSubmit={submit}>
          <FormGrid gridType={FormGridType.Row}>
            <FormGridFieldSet>
              <TextField
                name="search"
                placeholder="Search events..."
                hideErrors={true}
              />
            </FormGridFieldSet>

            <FormGridFieldSet>
              <DropDownField
                name="year"
                allowNull={true}
                nullLabel="Any year"
                options={yearOptions}
                hideErrors={true}
              />
            </FormGridFieldSet>

            <FormGridFieldSet>
              <SubmitButton variant={ButtonVariant.Important}>
                Search
              </SubmitButton>
            </FormGridFieldSet>
          </FormGrid>
        </Form>
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
