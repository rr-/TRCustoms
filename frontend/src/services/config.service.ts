import { AxiosResponse } from "axios";
import { EngineListing } from "src/services/engine.service";
import { GenreListing } from "src/services/genre.service";
import { TagListing } from "src/services/tag.service";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";

interface DurationListing {
  id: number;
  name: string;
}

interface DifficultyListing {
  id: number;
  name: string;
}

interface Config {
  tags: TagListing[];
  genres: GenreListing[];
  engines: EngineListing[];
  durations: DurationListing[];
  difficulties: DifficultyListing[];
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

const getConfig = async (): Promise<Config> => {
  const response = (await api.get(`${API_URL}/config/`)) as AxiosResponse<
    Config
  >;
  return response.data;
};

const ConfigService = {
  getConfig,
};

export type { Config };

export { ConfigService };
