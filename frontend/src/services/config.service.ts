import { AxiosResponse } from "axios";
import { EngineListing } from "src/services/engine.service";
import { GenreNested } from "src/services/genre.service";
import { GenreListing } from "src/services/genre.service";
import { LevelListing } from "src/services/level.service";
import { TagListing } from "src/services/tag.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";

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
  tags: TagListing[];
  genres: GenreListing[];
  engines: EngineListing[];
  durations: DurationListing[];
  difficulties: DifficultyListing[];
  review_questions: ReviewTemplateQuestion[];
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
  FeaturedLevels,
  DurationListing,
  DifficultyListing,
  ReviewTemplateAnswer,
  ReviewTemplateQuestion,
  Config,
};

export { FeatureType, ConfigService };
