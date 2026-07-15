import { eventsList, eventsRetrieve } from "src/client";
import type { EventDetails, EventListing } from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface EventSearchQuery extends GenericSearchQuery {
  year?: number | null | undefined;
}

interface EventSearchResult
  extends GenericSearchResult<EventSearchQuery, EventListing> {}

const searchEvents = async (
  searchQuery: EventSearchQuery,
): Promise<EventSearchResult> => {
  const query: { [key: string]: any } = {
    ...getGenericSearchQuery(searchQuery),
    year: searchQuery.year ?? undefined,
    page_size: 15,
  };
  const { data } = await eventsList({ query, throwOnError: true });
  return { ...data, searchQuery };
};

const getEventById = async (eventId: number): Promise<EventDetails> => {
  const { data } = await eventsRetrieve({
    path: { id: eventId },
    throwOnError: true,
  });
  return data;
};

const getFullTitle = (event: EventListing): string => {
  return event?.name && event?.subtitle
    ? `${event.name} - ${event.subtitle}`
    : event?.name
      ? event?.name
      : "Community event";
};

const EventService = {
  searchEvents,
  getEventById,
  getFullTitle,
};

export type { EventListing, EventSearchQuery, EventSearchResult, EventDetails };
export { EventService };
