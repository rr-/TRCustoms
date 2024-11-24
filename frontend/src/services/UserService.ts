import { AxiosResponse } from "axios";
import { api } from "src/api";
import { API_URL } from "src/constants";
import { AuthService } from "src/services/AuthService";
import type { CountryListing } from "src/services/ConfigService";
import type { UploadedFile } from "src/services/FileService";
import type { GenericSearchQuery } from "src/types";
import { GenericSearchResult } from "src/types";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getGenericSearchQuery } from "src/utils/misc";
import { boolToSearchString } from "src/utils/misc";

interface CountryNested extends CountryListing {}

enum UserPermission {
  editUsers = "edit_users",
  manageUsers = "manage_users",
  listUsers = "list_users",
  viewUsers = "view_users",
  uploadLevels = "upload_levels",
  editLevels = "edit_levels",
  rateLevels = "rate_levels",
  reviewLevels = "review_levels",
  deleteLevels = "delete_levels",
  editReviews = "edit_reviews",
  deleteReviews = "delete_reviews",
  editRatings = "edit_ratings",
  deleteRatings = "delete_ratings",
  editNews = "edit_news",
  reviewAuditLogs = "review_audit_logs",
  editTags = "edit_tags",
  postWalkthroughs = "post_walkthroughs",
  editWalkthroughs = "edit_walkthroughs",
  deleteWalkthroughs = "delete_walkthroughs",
  editPlaylists = "edit_playlists",
  viewPendingLevels = "view_pending_levels",
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
  picture: UploadedFile | null;
}

interface UserListing extends UserNested {
  email: string;
  bio: string;
  date_joined: string;
  last_login: string;
  is_active: boolean;
  is_banned: boolean;
  is_pending_activation: boolean;
  played_level_count: number;
  authored_level_count: number;
  rated_level_count: number;
  reviewed_level_count: number;
  authored_walkthrough_count: number;
  permissions: UserPermission[];
  trle_author_id: number | null;
  trle_reviewer_id: number | null;
}

interface UserDetails extends UserListing {
  website_url: string;
  donation_url: string;
  country?: CountryNested;
  is_staff: boolean;
  is_superuser: boolean;
  awards: UserAward[];
}

interface UserAward {
  created: string;
  code: string;
  title: string;
  description: string;
  position: number;
  tier: number;
  rarity: number;
}

interface UserSearchQuery extends GenericSearchQuery {
  reviewsMin?: number | undefined;
  hideInactiveReviewers?: boolean | undefined;
}

interface UserSearchResult
  extends GenericSearchResult<UserSearchQuery, UserListing> {}

const getCurrentUser = async (): Promise<UserDetails | null> => {
  if (!AuthService.getAccessToken()) {
    return null;
  }
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
  websiteUrl: string;
  donationUrl: string;
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
    websiteUrl,
    donationUrl,
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
    website_url: websiteUrl,
    donation_url: donationUrl,
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
  websiteUrl,
  donationUrl,
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
    website_url: websiteUrl,
    donation_url: donationUrl,
  };
  const response = (await api.post(`${API_URL}/users/`, data)) as AxiosResponse<
    UserDetails
  >;
  return response.data;
};

const searchUsers = async (
  searchQuery: UserSearchQuery
): Promise<UserSearchResult> => {
  const params = filterFalsyObjectValues({
    ...getGenericSearchQuery(searchQuery),
    reviews_min: searchQuery.reviewsMin,
    hide_inactive_reviewers: boolToSearchString(
      searchQuery.hideInactiveReviewers
    ),
  });
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

const requestPasswordReset = async (email: string): Promise<void> => {
  const data = { email };
  await api.post(`${API_URL}/users/request_password_reset/`, data);
};

const completePasswordReset = async (
  password: string,
  token: string
): Promise<void> => {
  const data = { password, token };
  await api.post(`${API_URL}/users/complete_password_reset/`, data);
};
const getAwardImageUrl = (award: UserAward) => {
  const stem = award.tier ? `${award.code}_${award.tier}` : award.code;
  return `/awards/${stem}.svg`;
};

const getAwardTierName = (tier: number) => {
  return {
    0: "",
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Jade",
    5: "Meteorite",
  }[tier];
};

const getAwardTitle = (award: UserAward) => {
  if (award.tier) {
    return `${award.title} (${getAwardTierName(award.tier)} Tier)`;
  }
  return award.title;
};

const UserService = {
  register,
  update,
  activate,
  deactivate,
  ban,
  unban,
  confirmEmail,
  requestPasswordReset,
  completePasswordReset,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  resendActivationLink,
  searchUsers,
  getAwardImageUrl,
  getAwardTierName,
  getAwardTitle,
};

export type {
  UserDetails,
  UserListing,
  UserBasic,
  UserNested,
  UserSearchQuery,
  UserSearchResult,
  UserAward,
};
export { UserPermission, UserService };
