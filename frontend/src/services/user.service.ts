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
};

export type { IUser };
export { UserService };
