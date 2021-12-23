import { fetchJSON } from "src/shared/client";
import { fetchMultipart } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { GenericQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { getGenericQuery } from "src/shared/utils";

interface UserQuery extends GenericQuery {}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  has_picture: boolean;
  bio: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  authored_level_count: number;
  reviewed_level_count: number;
}

interface UserList extends PagedResponse<User> {}

const getCurrentUser = async (): Promise<User | null> => {
  let data;
  try {
    data = await fetchJSON<User>(`${API_URL}/users/me/`, { method: "GET" });
  } catch (error) {
    data = null;
  }
  return data;
};

const getUserById = async (userId: number): Promise<User> => {
  let data;
  data = await fetchJSON<User>(`${API_URL}/users/${userId}/`, {
    method: "GET",
  });
  return data;
};

const getUserByUsername = async (username: string): Promise<User> => {
  let data;
  data = await fetchJSON<User>(`${API_URL}/users/by_username/${username}/`, {
    method: "GET",
  });
  return data;
};

interface UserCreatePayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
}

interface UserUpdatePayload extends UserCreatePayload {
  oldPassword: string;
}

const update = async (
  userId: number,
  {
    username,
    firstName,
    lastName,
    email,
    oldPassword,
    password,
    bio,
  }: UserUpdatePayload
): Promise<User> => {
  const data: { [key: string]: any } = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    bio: bio,
  };
  if (oldPassword) {
    data.old_password = oldPassword;
  }
  if (password) {
    data.password = password;
  }
  return await fetchJSON(`${API_URL}/users/${userId}/`, {
    method: "PATCH",
    data: data,
  });
};

const updatePicture = async (userId: number, file: File): Promise<null> => {
  const formData = new FormData();
  formData.append("picture", file);
  return await fetchMultipart(`${API_URL}/users/${userId}/picture/`, {
    method: "PATCH",
    data: formData,
  });
};

const register = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  bio,
}: UserCreatePayload): Promise<User> => {
  return await fetchJSON(`${API_URL}/users/`, {
    method: "POST",
    data: {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      bio: bio,
    },
  });
};

const getUsers = async (query: UserQuery): Promise<UserList | null> => {
  return await fetchJSON<UserList>(`${API_URL}/users/`, {
    query: getGenericQuery(query),
    method: "GET",
  });
};

const UserService = {
  register,
  update,
  updatePicture,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  getUsers,
};

export type { User, UserList, UserQuery };
export { UserService };
