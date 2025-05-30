import styles from "./index.module.css";
import {
  DefinitionList,
  DefinitionItemGroup,
  DefinitionItem,
} from "src/components/common/DefinitionList";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { UserPicLink } from "src/components/links/UserPicLink";
import type { EventDetails } from "src/services/EventService";

interface EventSidebarProps {
  event: EventDetails;
}

const getOrdinal = (n: number): string => {
  const v = n % 100;
  if (v >= 11 && v <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
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
          <DefinitionItem term="Name">{event.name}</DefinitionItem>
          {event.year != null && (
            <DefinitionItem term="Year">{event.year}</DefinitionItem>
          )}
          <DefinitionItem term="Level count">
            {event.level_count}
          </DefinitionItem>
          <DefinitionItem term="Host">
            <UserPicLink user={event.host} />
          </DefinitionItem>
        </DefinitionItemGroup>

        {event.winners.length > 0 && (
          <DefinitionItemGroup>
            <DefinitionItem span>
              <SectionHeader>Winners</SectionHeader>
            </DefinitionItem>
            {event.winners.map(({ place, user }) => (
              <DefinitionItem key={place} term={`${getOrdinal(place)} place`}>
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
