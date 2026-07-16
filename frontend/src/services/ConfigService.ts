import { configFeaturedLevelsRetrieve, configRetrieve } from "src/client";
import type {
  Config,
  CountryListing,
  FeaturedLevelListing as FeaturedLevel,
  FeaturedLevels,
  LevelDifficultyListing as DifficultyListing,
  LevelDurationListing as DurationListing,
  RatingTemplateAnswer,
  RatingTemplateQuestion,
} from "src/client";

enum FeatureType {
  NewRelease = "new_release",
  LevelOfTheDay = "level_of_the_day",
  MonthlyHiddenGem = "monthly_hidden_gem",
  BestInGenre = "best_in_genre",
}

const getConfig = async (): Promise<Config> => {
  const { data } = await configRetrieve({ throwOnError: true });
  return data;
};

const getFeaturedLevels = async (): Promise<FeaturedLevels> => {
  const { data } = await configFeaturedLevelsRetrieve({ throwOnError: true });
  return data;
};

const ConfigService = {
  getConfig,
  getFeaturedLevels,
};

export type {
  FeaturedLevel,
  CountryListing,
  FeaturedLevels,
  DurationListing,
  DifficultyListing,
  RatingTemplateAnswer,
  RatingTemplateQuestion,
  Config,
};

export { FeatureType, ConfigService };
