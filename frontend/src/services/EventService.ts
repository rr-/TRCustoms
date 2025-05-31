import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { LevelNested } from "src/services/LevelService";
import type { UserNested } from "src/services/UserService";
import type { GenericSearchQuery } from "src/types";
import type { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues, getGenericSearchQuery } from "src/utils/misc";

interface EventListing {
  id: number;
  name: string;
  subtitle: string | null;
  cover_image: { url: string } | null;
  year: number | null;
  level_count: number;
}

interface EventSearchQuery extends GenericSearchQuery {
  year?: number | null | undefined;
}

interface EventSearchResult
  extends GenericSearchResult<EventSearchQuery, EventListing> {}

interface EventDetails extends EventListing {
  about: string | null;
  host: UserNested | null;
  winners: { place: number; user: UserNested }[];
  levels: LevelNested[];
}

const searchEvents = async (
  searchQuery: EventSearchQuery,
): Promise<EventSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    year: searchQuery.year != null ? `${searchQuery.year}` : null,
  });
  const response = (await api.get(`${API_URL}/events/`, {
    params,
  })) as AxiosResponse<EventSearchResult>;
  return { ...response.data, searchQuery };
};

const getEventById = async (eventId: number): Promise<EventDetails> => {
  const response = await api.get<EventDetails>(`${API_URL}/events/${eventId}/`);
  return response.data;
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
