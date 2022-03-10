import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import type { CountryListing } from "src/services/ConfigService";
import type { UploadedFile } from "src/services/FileService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils";

interface CountryNested extends CountryListing {}

enum UserPermission {
  editUsers = "edit_users",
  listUsers = "list_users",
  uploadLevels = "upload_levels",
  editLevels = "edit_levels",
  reviewLevels = "review_levels",
  editReviews = "edit_reviews",
  editNews = "edit_news",
  reviewAuditLogs = "review_audit_logs",
  editTags = "edit_tags",
}

interface UserBasic {
  id: number;
  username: string;
  first_name?: string | undefined;
  last_name?: string | undefined;
}

interface UserNested extends UserBasic {
  first_name: string;
  last_name: string;
}

interface UserListing extends UserNested {
  email: string;
  picture: UploadedFile | null;
  bio: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  is_banned: boolean;
  is_pending_activation: boolean;
  authored_level_count: number;
  reviewed_level_count: number;
  permissions: UserPermission[];
  trle_author_id: number | null;
  trle_reviewer_id: number | null;
}

interface UserDetails extends UserListing {
  country?: CountryNested;
}

interface UserSearchQuery extends GenericSearchQuery {}
interface UserSearchResult
  extends GenericSearchResult<UserSearchQuery, UserListing> {}

const getCurrentUser = async (): Promise<UserDetails | null> => {
  try {
    const response = (await api.get(`${API_URL}/users/me/`)) as AxiosResponse<
      UserDetails
    >;
    return response.data;
  } catch (error) {
    return null;
  }
};

const getUserById = async (userId: number): Promise<UserDetails> => {
  const response = (await api.get(
    `${API_URL}/users/${userId}/`
  )) as AxiosResponse<UserDetails>;
  return response.data;
};

const getUserByUsername = async (username: string): Promise<UserDetails> => {
  const response = (await api.get(
    `${API_URL}/users/by_username/${username}/`
  )) as AxiosResponse<UserDetails>;
  return response.data;
};

interface UserCreatePayload {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio: string;
  pictureId?: number | undefined;
  countryCode?: string | undefined;
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
    pictureId,
    countryCode,
  }: UserUpdatePayload
): Promise<UserDetails> => {
  const data: { [key: string]: any } = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    bio: bio,
    picture_id: pictureId,
    country_code: countryCode,
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
  )) as AxiosResponse<UserDetails>;
  return response.data;
};

const register = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  bio,
  pictureId,
  countryCode,
}: UserCreatePayload): Promise<UserDetails> => {
  const data: { [key: string]: any } = {
    username: username,
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
    bio: bio,
    picture_id: pictureId,
    country_code: countryCode,
  };
  const response = (await api.post(`${API_URL}/users/`, data)) as AxiosResponse<
    UserDetails
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

const activate = async (userId: number): Promise<void> => {
  await api.post(`${API_URL}/users/${userId}/activate/`);
};

const deactivate = async (userId: number, reason: string): Promise<void> => {
  const data = { reason };
  await api.post(`${API_URL}/users/${userId}/deactivate/`, data);
};

const ban = async (userId: number, reason: string): Promise<void> => {
  const data = { reason };
  await api.post(`${API_URL}/users/${userId}/ban/`, data);
};

const unban = async (userId: number): Promise<void> => {
  await api.post(`${API_URL}/users/${userId}/unban/`);
};

const resendActivationLink = async (username: string): Promise<void> => {
  const data = { username };
  await api.post(`${API_URL}/users/resend_activation_email/`, data);
};

const confirmEmail = async (token: string): Promise<UserDetails> => {
  const data = { token };
  const response = (await api.post(
    `${API_URL}/users/confirm_email/`,
    data
  )) as AxiosResponse<UserDetails>;
  return response.data;
};

const UserService = {
  register,
  update,
  activate,
  deactivate,
  ban,
  unban,
  confirmEmail,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  resendActivationLink,
  searchUsers,
};

export type {
  UserDetails,
  UserListing,
  UserBasic,
  UserNested,
  UserSearchQuery,
  UserSearchResult,
};
export { UserPermission, UserService };
