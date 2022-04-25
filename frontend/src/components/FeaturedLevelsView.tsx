import "./FeaturedLevelsView.css";
import { useQuery } from "react-query";
import { Loader } from "src/components/Loader";
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
  return (
    <div className="FeaturedLevelView">
      <h2 className="FeaturedLevelView--heading">{heading}</h2>
      {level?.cover && (
        <LevelLink level={level}>
          <img
            className="FeaturedLevelView--coverImage"
            src={level.cover.url}
            alt={level.name}
          />
        </LevelLink>
      )}
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
