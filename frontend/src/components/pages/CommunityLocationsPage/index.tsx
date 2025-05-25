import styles from "./index.module.css";
import { useContext, useState, useCallback } from "react";
import { useQuery } from "react-query";
import { AutoComplete } from "src/components/common/AutoComplete";
import {
  DataTable,
  type DataTableColumn,
} from "src/components/common/DataTable";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { Loader } from "src/components/common/Loader";
import { MapWidget } from "src/components/common/MapWidget";
import { Section, SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { UserPicLink } from "src/components/links/UserPicLink";
import { ConfigContext } from "src/contexts/ConfigContext";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { CountryListing } from "src/services/ConfigService";
import type { UserListing, UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import type { GenericSearchResult } from "src/types";
import { formatDate } from "src/utils/string";

interface LocationUserTableProps {
  selectedCountry: CountryListing | null;
  searchQuery: UserSearchQuery;
  setSearchQuery: (query: UserSearchQuery) => void;
  usersResult: GenericSearchResult<UserSearchQuery, UserListing>;
}

const LocationUserTable = ({
  selectedCountry,
  usersResult,
  searchQuery,
  setSearchQuery,
}: LocationUserTableProps) => {
  const columns: DataTableColumn<UserListing>[] = [
    {
      name: "username",
      className: styles.username,
      sortKey: "username",
      label: "Username",
      itemElement: ({ item }) => <UserPicLink user={item} />,
    },
    {
      name: "date_joined",
      sortKey: "date_joined",
      className: styles.dateJoined,
      label: "Join date",
      itemElement: ({ item }) => formatDate(item.date_joined),
    },
  ];

  if (!selectedCountry) {
    return null;
  }
  if (usersResult.isLoading || !usersResult.data) {
    return <Loader />;
  }
  return (
    <Section>
      <SectionHeader>
        Users from{" "}
        {selectedCountry.name === "Unknown"
          ? "unknown country"
          : selectedCountry.name}
        {` (${usersResult.data.total_count})`}
      </SectionHeader>
      <DataTable
        className={styles.table}
        queryName="community_locations_users"
        columns={columns}
        itemKey={(item) => `${item.id}`}
        searchQuery={searchQuery}
        searchFunc={UserService.searchUsers}
        onSearchQueryChange={setSearchQuery}
      />
    </Section>
  );
};

const CommunityLocationsPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Community locations",
      description: "Find user locations.",
      image: "card-community_locations.jpg",
    }),
    [],
  );

  const { config } = useContext(ConfigContext);
  const [selectedCountry, setSelectedCountry] = useState<CountryListing | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<CountryListing[]>([]);

  const unknownCountry: CountryListing = {
    iso_3166_1_alpha2: "",
    iso_3166_1_numeric: "",
    name: "Unknown",
  };

  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({
    page: null,
    sort: "-authored_level_count_approved",
    countryCode: undefined,
    authoredLevelsMin: undefined,
  });

  const usersResult = useQuery<
    GenericSearchResult<UserSearchQuery, UserListing>,
    Error
  >(
    ["community_locations_users", UserService.searchUsers, searchQuery],
    () => UserService.searchUsers(searchQuery),
    { enabled: !!selectedCountry },
  );

  const handleSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      const filtered = config.countries.filter((country) =>
        country.name.toLowerCase().includes(userInput.toLowerCase()),
      );
      setSuggestions([...filtered, unknownCountry]);
    },
    [setSuggestions, config],
  );

  const handleCountryChange = useCallback(
    (country: CountryListing | null) => {
      setSelectedCountry(country);
      if (country) {
        setSearchQuery({
          page: null,
          sort: "-authored_level_count_approved",
          countryCode: country.iso_3166_1_alpha2,
          authoredLevelsMin: 1,
        });
      } else {
        setSearchQuery({
          page: null,
          sort: "-authored_level_count_approved",
          countryCode: undefined,
          authoredLevelsMin: undefined,
        });
      }
    },
    [setSelectedCountry, setSearchQuery],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Community locations</SectionHeader>

        <FormGrid gridType={FormGridType.Row}>
          <FormGridFieldSet>
            <AutoComplete
              suggestions={suggestions}
              getResultText={(country) => country.name}
              getResultKey={(country) => country.iso_3166_1_alpha2}
              onSearchTrigger={handleSearchTrigger}
              onResultApply={handleCountryChange}
              placeholder="Find a country..."
            />
            {selectedCountry && (
              <>
                Selected country: {selectedCountry.name}{" "}
                {selectedCountry.iso_3166_1_alpha2 &&
                  `(${selectedCountry.iso_3166_1_alpha2})`}
              </>
            )}
          </FormGridFieldSet>
        </FormGrid>

        <div
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          <MapWidget country={selectedCountry} onChange={handleCountryChange} />
        </div>
      </Section>
      <LocationUserTable
        selectedCountry={selectedCountry}
        usersResult={usersResult}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </SidebarLayout>
  );
};

export { CommunityLocationsPage };
