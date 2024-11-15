import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import { EngineListing } from "src/services/EngineService";
import { GenreNested } from "src/services/GenreService";
import { GenreListing } from "src/services/GenreService";
import { LevelListing } from "src/services/LevelService";
import { TagListing } from "src/services/TagService";

interface CountryListing {
  code: string;
  name: string;
}

enum FeatureType {
  NewRelease = "new_release",
  LevelOfTheDay = "level_of_the_day",
  MonthlyHiddenGem = "monthly_hidden_gem",
  BestInGenre = "best_in_genre",
}

interface FeaturedLevel {
  created: string;
  feature_type: FeatureType;
  level: LevelListing | null;
  chosen_genre: GenreNested | null;
}

interface DurationListing {
  id: number;
  name: string;
  position: number;
}

interface DifficultyListing {
  id: number;
  name: string;
  position: number;
}

interface RatingTemplateAnswer {
  position: number;
  id: number;
  answer_text: string;
}

interface RatingTemplateQuestion {
  position: number;
  id: number;
  question_text: string;
  answers: RatingTemplateAnswer[];
}

interface Config {
  countries: CountryListing[];
  tags: TagListing[];
  genres: GenreListing[];
  engines: EngineListing[];
  durations: DurationListing[];
  difficulties: DifficultyListing[];
  rating_questions: RatingTemplateQuestion[];
  limits: {
    min_tags: number;
    max_tags: number;
    min_genres: number;
    max_genres: number;
    min_screenshots: number;
    max_screenshots: number;
    min_showcase_links: number;
    max_showcase_links: number;
    min_authors: number;
    max_authors: number;
    max_tag_length: number;
  };
  stats: {
    total_levels: number;
    total_reviews: number;
    total_downloads: number;
    total_walkthroughs: number;
    reviews: {
      rating_class: {
        id: number;
        position: number;
        name: string;
      };
      level_count: number;
    }[];
    walkthroughs: {
      video_and_text: number;
      video: number;
      text: number;
      none: number;
    };
  };
}

type FeaturedLevels = {
  [K in FeatureType]: FeaturedLevel | null;
};

const getConfig = async (): Promise<Config> => {
  const response = (await api.get(`${API_URL}/config/`)) as AxiosResponse<
    Config
  >;
  return response.data;
};

const getFeaturedLevels = async (): Promise<FeaturedLevels> => {
  const response = (await api.get(
    `${API_URL}/config/featured_levels`
  )) as AxiosResponse<FeaturedLevels>;
  return response.data;
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
