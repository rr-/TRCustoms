import { fetchJSON } from "src/shared/client";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { getGenericSearchQuery } from "src/shared/utils";

enum UserPermission {
  editUsers = "edit_users",
  listUsers = "list_users",
}

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
  picture: number;
  permissions: UserPermission[];
}

interface UserList extends PagedResponse<User> {}
interface UserSearchQuery extends GenericSearchQuery {}
interface UserSearchResult extends GenericSearchResult<UserSearchQuery, User> {}

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
  picture: number;
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
    picture,
  }: UserUpdatePayload
): Promise<User> => {
  const data: { [key: string]: any } = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    bio: bio,
    picture: picture,
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

const register = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  bio,
  picture,
}: UserCreatePayload): Promise<User> => {
  const data: { [key: string]: any } = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
    bio: bio,
    picture: picture,
  };
  return await fetchJSON(`${API_URL}/users/`, {
    method: "POST",
    data: data,
  });
};

const searchUsers = async (
  searchQuery: UserSearchQuery
): Promise<UserSearchResult | null> => {
  const result = await fetchJSON<UserList>(`${API_URL}/users/`, {
    query: getGenericSearchQuery(searchQuery),
    method: "GET",
  });
  return { searchQuery: searchQuery, ...result };
};

const UserService = {
  register,
  update,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  searchUsers,
};

export type { User, UserList, UserSearchQuery, UserSearchResult };
export { UserPermission, UserService };
