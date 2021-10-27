import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";

interface IUser {
  username: string;
}

const getCurrentUser = async (): Promise<IUser | null> => {
  let data;
  try {
    data = await fetchJSON<IUser>(`${API_URL}/auth/me/`, { method: "GET" });
  } catch (error) {
    data = null;
  }
  return data;
};

const register = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  await fetchJSON(`${API_URL}/users/`, {
    method: "POST",
    data: {
      username: username,
      email: email,
      password: password,
    },
  });
};

const UserService = {
  register,
  getCurrentUser,
};

export type { IUser };
export { UserService };
