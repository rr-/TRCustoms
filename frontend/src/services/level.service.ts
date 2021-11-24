import { IUser } from "src/services/user.service";
import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import { IPagedResponse } from "src/shared/types";

interface ILevelEngine {
  name: string;
}

interface ILevelTag {
  name: string;
}

interface ILevelGenre {
  name: string;
}

interface ILevel {
  name: string;
  description: string;
  genres: ILevelGenre[];
  tags: ILevelTag[];
  engine: ILevelEngine;
  author_name: string | null;
  author_user: IUser | null;
  uploader: IUser | null;
  created: string;
  last_updated: string;
}

interface ILevelQuery {
  page: number | null;
}

interface ILevelList extends IPagedResponse<ILevel> {}

const getLevels = async (query: ILevelQuery): Promise<ILevelList | null> => {
  let data;
  try {
    data = await fetchJSON<ILevelList>(`${API_URL}/levels/`, {
      query: { page: query.page },
      method: "GET",
    });
  } catch (error) {
    data = null;
  }
  return data;
};

const LevelService = {
  getLevels,
};

export type { ILevel, ILevelList };
export { LevelService };
