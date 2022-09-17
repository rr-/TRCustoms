import styles from "./index.module.css";
import { useQuery } from "react-query";
import { Box } from "src/components/Box";
import { Loader } from "src/components/Loader";
import { SectionHeader } from "src/components/Section";
import { LevelAuthorsLink } from "src/components/links/LevelAuthorsLink";
import { LevelLink } from "src/components/links/LevelLink";
import { Markdown } from "src/components/markdown/Markdown";
import type { FeaturedLevels } from "src/services/ConfigService";
import type { FeaturedLevel } from "src/services/ConfigService";
import { FeatureType } from "src/services/ConfigService";
import { ConfigService } from "src/services/ConfigService";

interface FeaturedLevelViewProps {
  featuredLevel: FeaturedLevel | null;
  featureType: FeatureType;
}

const getHeading = (
  featuredLevel: FeaturedLevel | null,
  featureType: FeatureType
): string => {
  switch (featuredLevel?.feature_type || featureType) {
    case FeatureType.MonthlyHiddenGem:
      return "Monthly Hidden Gem";
    case FeatureType.LevelOfTheDay:
      return "Level of the Day";
    case FeatureType.BestInGenre:
      return `Best in ${featuredLevel?.chosen_genre?.name || "Genre"}`;
  }
  return "Featured Level";
};

const FeaturedLevelView = ({
  featuredLevel,
  featureType,
}: FeaturedLevelViewProps) => {
  const level = featuredLevel?.level;
  const heading = getHeading(featuredLevel, featureType);
  const background = level?.screenshots?.[0]?.file?.url;

  return (
    <Box className={styles.container}>
      <div
        className={styles.background}
        style={background ? { backgroundImage: `url('${background}')` } : {}}
      />
      <div className={styles.foreground}>
        <SectionHeader className={styles.header}>{heading}</SectionHeader>

        <div className={styles.details}>
          {!!level?.cover && (
            <LevelLink level={level} className={styles.coverLink}>
              <img
                className={styles.coverImage}
                src={level.cover.url}
                alt={level.name}
              />
            </LevelLink>
          )}

          <div>
            <h3 className={styles.levelTitle}>
              {level ? (
                <>
                  <LevelLink level={level} /> by{" "}
                  <LevelAuthorsLink authors={level.authors} />
                </>
              ) : (
                "No level featured yet."
              )}
            </h3>
            {level && (
              <div className={styles.synopsis}>
                <Markdown>{level.description}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
};

const FeaturedLevelsView = () => {
  const result = useQuery<FeaturedLevels, Error>(
    ["featuredLevels", ConfigService.getFeaturedLevels],
    async () => ConfigService.getFeaturedLevels()
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  return (
    <div className="FeaturedLevelsView">
      {Object.values(FeatureType).map((featureType) => (
        <FeaturedLevelView
          key={featureType}
          featuredLevel={result.data[featureType]}
          featureType={featureType}
        />
      ))}
    </div>
  );
};

export { FeaturedLevelsView };
