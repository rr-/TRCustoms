import { AxiosResponse } from "axios";
import { api } from "src/shared/api";
import { API_URL } from "src/shared/constants";
import type { GenericSearchQuery } from "src/shared/types";
import type { PagedResponse } from "src/shared/types";
import { GenericSearchResult } from "src/shared/types";
import { getGenericSearchQuery } from "src/shared/utils";

enum UserPermission {
  editUsers = "edit_users",
  listUsers = "list_users",
  uploadLevels = "upload_levels",
  editLevels = "edit_levels",
}

interface UserLite {
  id: number | null;
  username: string;
  first_name: string;
  last_name: string;
}

interface User extends UserLite {
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
  trle_author_id?: number;
  trle_reviewer_id?: number;
}

interface UserList extends PagedResponse<User> {}
interface UserSearchQuery extends GenericSearchQuery {}
interface UserSearchResult extends GenericSearchResult<UserSearchQuery, User> {}

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = (await api.get(`${API_URL}/users/me/`)) as AxiosResponse<
      User
    >;
    return response.data;
  } catch (error) {
    return null;
  }
};

const getUserById = async (userId: number): Promise<User> => {
  const response = (await api.get(
    `${API_URL}/users/${userId}/`
  )) as AxiosResponse<User>;
  return response.data;
};

const getUserByUsername = async (username: string): Promise<User> => {
  const response = (await api.get(
    `${API_URL}/users/by_username/${username}/`
  )) as AxiosResponse<User>;
  return response.data;
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
  const response = (await api.patch(
    `${API_URL}/users/${userId}/`,
    data
  )) as AxiosResponse<User>;
  return response.data;
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
  const response = (await api.post(`${API_URL}/users/`, data)) as AxiosResponse<
    User
  >;
  return response.data;
};

const searchUsers = async (
  searchQuery: UserSearchQuery
): Promise<UserSearchResult> => {
  const params = getGenericSearchQuery(searchQuery);
  const response = (await api.get(`${API_URL}/users/`, {
    params,
  })) as AxiosResponse<UserSearchResult>;
  return { ...response.data, searchQuery };
};

const UserService = {
  register,
  update,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  searchUsers,
};

export type { User, UserLite, UserList, UserSearchQuery, UserSearchResult };
export { UserPermission, UserService };
