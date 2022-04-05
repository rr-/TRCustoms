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
  LevelOfTheDay = "lod",
  MonthlyHiddenGem = "gem",
  BestInGenre = "big",
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
}

interface DifficultyListing {
  id: number;
  name: string;
}

interface ReviewTemplateAnswer {
  position: number;
  id: number;
  answer_text: string;
}

interface ReviewTemplateQuestion {
  position: number;
  id: number;
  question_text: string;
  answers: ReviewTemplateAnswer[];
}

interface Config {
  countries: CountryListing[];
  tags: TagListing[];
  genres: GenreListing[];
  engines: EngineListing[];
  durations: DurationListing[];
  difficulties: DifficultyListing[];
  review_questions: ReviewTemplateQuestion[];
  review_stats: {
    rating_class: {
      id: number;
      position: number;
      name: string;
    };
    level_count: number;
  }[];
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
  total_levels: number;
  total_reviews: number;
  total_downloads: number;
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
  ReviewTemplateAnswer,
  ReviewTemplateQuestion,
  Config,
};

export { FeatureType, ConfigService };
