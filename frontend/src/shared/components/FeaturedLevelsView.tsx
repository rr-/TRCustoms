import "./FeaturedLevelsView.css";
import { useQuery } from "react-query";
import type { FeaturedLevels } from "src/services/config.service";
import type { FeaturedLevel } from "src/services/config.service";
import { FeatureType } from "src/services/config.service";
import { ConfigService } from "src/services/config.service";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { LevelAuthorsLink } from "src/shared/components/links/LevelAuthorsLink";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { DisplayMode } from "src/shared/types";

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
  return (
    <div className="FeaturedLevelView">
      <h2 className="FeaturedLevelView--heading">{heading}</h2>
      <MediumThumbnail
        displayMode={DisplayMode.Cover}
        file={level?.cover || undefined}
      />
      <div className="FeaturedLevelView--detailsWrapper">
        <div className="FeaturedLevelView--details">
          <h2 className="FeaturedLevelView--levelLink">
            {level ? <LevelLink level={level} /> : "No level featured yet."}
          </h2>
          {level && (
            <h4 className="FeaturedLevelView--authorLink">
              By <LevelAuthorsLink authors={level.authors} />
            </h4>
          )}
          {level && (
            <div className="FeaturedLevelView--synopsis">
              <Markdown>{level.description}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
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
