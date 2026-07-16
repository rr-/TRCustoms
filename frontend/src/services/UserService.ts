import {
  usersActivateCreate,
  usersBanCreate,
  usersByUsernameRetrieve,
  usersCompletePasswordResetCreate,
  usersConfirmEmailCreate,
  usersCreate,
  usersDeactivateCreate,
  usersList,
  usersMeRetrieve,
  usersPartialUpdate,
  usersRequestPasswordResetCreate,
  usersResendActivationEmailCreate,
  usersRetrieve,
  usersUnbanCreate,
} from "src/client";
import type {
  UserAward,
  UserDetails,
  UserListing,
  UserNested,
} from "src/client";
import { AuthService } from "src/services/AuthService";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { boolToSearchString, getGenericSearchQuery } from "src/utils/misc";

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

interface UserSearchQuery extends GenericSearchQuery {
  reviewsMin?: number;
  hideInactiveReviewers?: boolean;
  countryCode?: string;
  authoredLevelsMin?: number;
}

interface UserSearchResult
  extends GenericSearchResult<UserSearchQuery, UserListing> {}

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
  settings?: UserDetails["settings"];
}

const getCurrentUser = async (): Promise<UserDetails | null> => {
  if (!AuthService.getAccessToken()) {
    return null;
  }
  // Inspect the status rather than throwOnError: only genuine auth failures
  // mean "logged out". A transient 500 or network error must propagate so the
  // caller can keep the existing session instead of silently signing out.
  const { data, response } = await usersMeRetrieve();
  if (response && (response.status === 401 || response.status === 403)) {
    return null;
  }
  if (!response?.ok || !data) {
    throw new Error(
      `Failed to fetch the current user (${response?.status ?? "no response"})`,
    );
  }
  return data;
};

const getUserById = async (userId: number): Promise<UserDetails> => {
  const { data } = await usersRetrieve({
    path: { id: userId },
    throwOnError: true,
  });
  return data;
};

const getUserByUsername = async (username: string): Promise<UserDetails> => {
  const { data } = await usersByUsernameRetrieve({
    path: { username },
    throwOnError: true,
  });
  return data;
};

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
    settings,
  }: Partial<UserUpdatePayload>,
): Promise<UserDetails> => {
  const body: { [key: string]: any } = {
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
    body.old_password = oldPassword;
  }
  if (password) {
    body.password = password;
  }
  if (settings) {
    body.settings = settings;
  }
  const { data } = await usersPartialUpdate({
    path: { id: userId },
    body,
    throwOnError: true,
  });
  return data;
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
  const { data } = await usersCreate({
    body: {
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
    },
    throwOnError: true,
  });
  return data;
};

const searchUsers = async (
  searchQuery: UserSearchQuery,
): Promise<UserSearchResult> => {
  const query: { [key: string]: any } = {
    ...getGenericSearchQuery(searchQuery),
    reviews_min: searchQuery.reviewsMin,
    hide_inactive_reviewers: boolToSearchString(
      searchQuery.hideInactiveReviewers,
    ),
    country_code: searchQuery.countryCode,
    authored_levels_min: searchQuery.authoredLevelsMin,
  };
  const { data } = await usersList({ query, throwOnError: true });
  return { ...data, searchQuery };
};

const activate = async (userId: number): Promise<void> => {
  await usersActivateCreate({ path: { id: userId }, throwOnError: true });
};

const deactivate = async (userId: number, reason: string): Promise<void> => {
  await usersDeactivateCreate({
    path: { id: userId },
    body: { reason },
    throwOnError: true,
  });
};

const ban = async (userId: number, reason: string): Promise<void> => {
  await usersBanCreate({
    path: { id: userId },
    body: { reason },
    throwOnError: true,
  });
};

const unban = async (userId: number): Promise<void> => {
  await usersUnbanCreate({ path: { id: userId }, throwOnError: true });
};

const resendActivationLink = async (username: string): Promise<void> => {
  await usersResendActivationEmailCreate({
    body: { username },
    throwOnError: true,
  });
};

const confirmEmail = async (token: string): Promise<UserDetails> => {
  const { data } = await usersConfirmEmailCreate({
    body: { token },
    throwOnError: true,
  });
  return data;
};

const requestPasswordReset = async (email: string): Promise<void> => {
  await usersRequestPasswordResetCreate({
    body: { email },
    throwOnError: true,
  });
};

const completePasswordReset = async (
  password: string,
  token: string,
): Promise<void> => {
  await usersCompletePasswordResetCreate({
    body: { password, token },
    throwOnError: true,
  });
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
