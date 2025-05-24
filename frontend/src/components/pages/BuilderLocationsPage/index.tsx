import { useContext, useState, useEffect } from "react";
import { useCallback } from "react";
import { AutoComplete } from "src/components/common/AutoComplete";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { MapWidget } from "src/components/common/MapWidget";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { ConfigContext } from "src/contexts/ConfigContext";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { CountryListing } from "src/services/ConfigService";

const BuilderLocationsPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Builder locations",
      description: "Find builder locations.",
      image: "card-builder_locations.jpg",
    }),
    [],
  );

  const { config } = useContext(ConfigContext);
  const [selectedCountry, setSelectedCountry] = useState<CountryListing | null>(
    null,
  );
  const [countryInput, setCountryInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<CountryListing[]>([]);

  useEffect(() => {
    setCountryInput(selectedCountry?.name ?? "");
  }, [selectedCountry]);

  const handleCountryInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const name = event.target.value;
    setCountryInput(name);
    const match = config.countries.find((c) => c.name === name);
    setSelectedCountry(match || null);
  };

  const handleSearchTrigger = useCallback(
    async (userInput: string) => {
      if (!userInput) {
        setSuggestions([]);
        return;
      }
      setSuggestions(
        config.countries.filter((country) =>
          country.name.toLowerCase().includes(userInput.toLowerCase()),
        ),
      );
      0;
    },
    [setSuggestions, config],
  );

  const handleResultApply = useCallback(
    async (country: CountryListing) => {
      setSelectedCountry(country);
    },
    [setSelectedCountry],
  );

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Builder locations</SectionHeader>

        <FormGrid gridType={FormGridType.Row}>
          <FormGridFieldSet>
            <AutoComplete
              suggestions={suggestions}
              getResultText={(country) => country.name}
              getResultKey={(country) => country.iso_3166_1_alpha2}
              onSearchTrigger={handleSearchTrigger}
              onResultApply={handleResultApply}
              placeholder="Find a country..."
            />
            {selectedCountry && (
              <>
                Selected Country: {selectedCountry.name} (
                {selectedCountry.iso_3166_1_alpha2})
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
          <MapWidget country={selectedCountry} onChange={setSelectedCountry} />
        </div>
      </Section>
    </SidebarLayout>
  );
};

export { BuilderLocationsPage };
