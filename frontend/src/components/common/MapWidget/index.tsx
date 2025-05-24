import styles from "./index.module.css";
import { geoCylindricalStereographic } from "d3-geo-projection";
import { useContext, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ConfigContext } from "src/contexts/ConfigContext";
import type { CountryListing } from "src/services/ConfigService";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

interface MapWidgetProps {
  country: CountryListing | null;
  onChange: (country: CountryListing | null) => void;
}

export const MapWidget = ({ country, onChange }: MapWidgetProps) => {
  const { config } = useContext(ConfigContext);
  const geoFeatures = useMemo(
    () =>
      feature(worldData as any, (worldData as any).objects.countries).features,
    [],
  );

  const handleClick = (selCountry: CountryListing | undefined) => {
    if (!selCountry) {
      return;
    }
    // toggle selection: deselect if already selected
    onChange(country === selCountry ? null : selCountry);
  };

  const width = 800;
  const height = 360;
  const projection = geoCylindricalStereographic()
    .translate([width / 2, height / 2 + 40])
    .scale(120);

  return (
    <ComposableMap
      width={width}
      height={height}
      projection={projection}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <Geographies geography={geoFeatures}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const geoCountry = config.countries.filter(
              (geoCountry) => geoCountry.iso_3166_1_numeric === geo.id,
            )[0];
            const isSelected =
              country && country?.iso_3166_1_numeric === geo.id;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleClick(geoCountry)}
                className={[
                  styles.geography,
                  isSelected ? styles.selected : "",
                ].join(" ")}
              />
            );
          })
        }
      </Geographies>

      <Geographies geography={geoFeatures}>
        {({ geographies }) =>
          geographies.map((geo) => {
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className={styles.border}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
};
