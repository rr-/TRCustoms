import styles from "./index.module.css";
import {
  DefinitionList,
  DefinitionItemGroup,
  DefinitionItem,
} from "src/components/common/DefinitionList";
import { Link } from "src/components/common/Link";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { UserPicLink } from "src/components/links/UserPicLink";
import type { EventDetails } from "src/services/EventService";

interface EventSidebarProps {
  event: EventDetails;
}

const getOrdinalPostfix = (n: number): string => {
  const v = n % 100;
  if (v >= 11 && v <= 13) {
    return "th";
  }
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const FormatPlace = ({ place }: { place: number }) => {
  return (
    <>
      {place}
      <sup>{getOrdinalPostfix(place)}</sup> place
    </>
  );
};

const EventSidebar = ({ event }: EventSidebarProps) => {
  return (
    <SidebarBox>
      {event.cover_image?.url && (
        <img
          className={styles.coverImage}
          src={event.cover_image.url}
          alt={event.name}
        />
      )}

      <DefinitionList>
        <DefinitionItemGroup>
          <DefinitionItem span>
            <SectionHeader>Details</SectionHeader>
          </DefinitionItem>
          <DefinitionItem term="Event">
            <Link
              to={`/extras/event_catalogue?search=${encodeURIComponent(
                event.name,
              )}`}
            >
              {event.name}
            </Link>
          </DefinitionItem>
          {event.year != null && (
            <DefinitionItem term="Year">{event.year}</DefinitionItem>
          )}
          <DefinitionItem term="Level count">
            {event.level_count}
          </DefinitionItem>
          {event.host && (
            <DefinitionItem term="Host">
              <UserPicLink user={event.host} />
            </DefinitionItem>
          )}
        </DefinitionItemGroup>

        {event.winners.length > 0 && (
          <DefinitionItemGroup>
            <DefinitionItem span>
              <SectionHeader>Winners</SectionHeader>
            </DefinitionItem>
            {event.winners.map(({ place, user }) => (
              <DefinitionItem key={place} term={<FormatPlace place={place} />}>
                <UserPicLink user={user} />
              </DefinitionItem>
            ))}
          </DefinitionItemGroup>
        )}
      </DefinitionList>
    </SidebarBox>
  );
};

export { EventSidebar };
