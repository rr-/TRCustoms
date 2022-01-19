import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";

interface Config {
  tags: { id: number; name: string }[];
  genres: { id: number; name: string; description: string }[];
  engines: { id: number; name: string }[];
  durations: { id: number; name: string }[];
  difficulties: { id: number; name: string }[];
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
