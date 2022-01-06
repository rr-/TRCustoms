import { fetchJSON } from "src/shared/client";
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
    min_authors: number;
    max_authors: number;
  };
}

const getConfig = async (): Promise<Config> => {
  return await fetchJSON<Config>(`${API_URL}/config/`, {
    method: "GET",
  });
};

const ConfigService = {
  getConfig,
};

export type { Config };

export { ConfigService };
