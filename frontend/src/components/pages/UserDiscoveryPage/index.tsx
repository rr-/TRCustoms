import { useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "src/components/common/AutoComplete";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { MapWidget } from "src/components/common/MapWidget";
import { Section, SectionHeader } from "src/components/common/Section";
import { UserFancyList } from "src/components/common/UserFancyList";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { ConfigContext } from "src/contexts/ConfigContext";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { CountryListing } from "src/services/ConfigService";
import type { UserListing, UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";

interface LocationUserTableProps {
  selectedCountry: CountryListing | null;
  searchQuery: UserSearchQuery;
  setSearchQuery: (query: UserSearchQuery) => void;
}

const LocationUserTable = ({
  selectedCountry,
  searchQuery,
  setSearchQuery,
}: LocationUserTableProps) => {
  const [count, setCount] = useState<number>(undefined);
  if (!selectedCountry) {
    return null;
  }

  return (
    <Section>
      <SectionHeader>
        Users from{" "}
        {!selectedCountry.iso_3166_1_alpha2
          ? "unknown country"
          : selectedCountry.name}
        {count !== undefined ? <> ({count})</> : null}
      </SectionHeader>

      <UserFancyList
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onResultCountChange={setCount}
      />
    </Section>
  );
};

const UserDiscoveryPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "User discovery",
      description: "Find users and see their locations around the world.",
      image: "card-user_discovery.jpg",
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
  });

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
        });
      } else {
        setSearchQuery({
          page: null,
          sort: "-authored_level_count_approved",
          countryCode: undefined,
        });
      }
    },
    [setSelectedCountry, setSearchQuery],
  );

  const [userSuggestions, setUserSuggestions] = useState<UserListing[]>([]);
  const navigate = useNavigate();
  const handleUserSearchTrigger = useCallback(async (userInput: string) => {
    if (!userInput) {
      setUserSuggestions([]);
      return;
    }
    try {
      const response = await UserService.searchUsers({ search: userInput });
      if (response.results) {
        setUserSuggestions(response.results);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);
  const handleUserResultApply = useCallback(
    (user: UserListing) => {
      navigate(`/users/${user.id}`);
    },
    [navigate],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>User discovery</SectionHeader>

        <FormGrid gridType={FormGridType.Row}>
          <FormGridFieldSet>
            <AutoComplete
              suggestions={userSuggestions}
              getResultText={(user) => user.username}
              getResultKey={(user) => user.id}
              onSearchTrigger={handleUserSearchTrigger}
              onResultApply={handleUserResultApply}
              placeholder="Find a user..."
            />
          </FormGridFieldSet>
          OR
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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </SidebarLayout>
  );
};

export { UserDiscoveryPage };
