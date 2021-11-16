import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";

interface IUser {
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  date_joined: string;
  last_login: string;
}

const getCurrentUser = async (): Promise<IUser | null> => {
  let data;
  try {
    data = await fetchJSON<IUser>(`${API_URL}/users/me/`, { method: "GET" });
  } catch (error) {
    data = null;
  }
  return data;
};

const getUserById = async (userName: string): Promise<IUser | null> => {
  let data;
  try {
    data = await fetchJSON<IUser>(`${API_URL}/users/${userName}`, {
      method: "GET",
    });
  } catch (error) {
    console.error(error);
    data = null;
  }
  return data;
};

const register = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  bio,
}: {
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string;
  bio: string | null;
}) => {
  await fetchJSON(`${API_URL}/users/`, {
    method: "POST",
    data: {
      username: username,
      first_name: firstName || null,
      last_name: lastName || null,
      email: email,
      password: password,
      bio: bio || null,
    },
  });
};

const UserService = {
  register,
  getCurrentUser,
  getUserById,
};

export type { IUser };
export { UserService };
