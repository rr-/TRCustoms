import {
  messagesQuotaRetrieve,
  messagesSettingsRetrieve,
  messagesSettingsUpdate,
  messagesThreadsCreate,
  messagesThreadsList,
  messagesThreadsMarkUnreadCreate,
  messagesThreadsMessagesList,
  messagesThreadsReplyCreate,
  messagesThreadsRetrieve,
} from "src/client";
import type {
  Message,
  MessageQuota,
  MessageSettings,
  ThreadDetails,
  ThreadListing,
} from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

interface ThreadSearchQuery extends GenericSearchQuery {
  asAdministrator?: boolean | undefined;
}

interface ThreadSearchResult
  extends GenericSearchResult<ThreadSearchQuery, ThreadListing> {}

interface ThreadMessagesSearchQuery extends GenericSearchQuery {
  threadId: number;
}

interface ThreadMessagesSearchResult
  extends GenericSearchResult<ThreadMessagesSearchQuery, Message> {}

interface MessageSendPayload {
  receiverId: number;
  text: string;
  sendAsAdministrator: boolean;
}

const searchThreads = async (
  searchQuery: ThreadSearchQuery,
): Promise<ThreadSearchResult> => {
  const { data } = await messagesThreadsList({
    query: {
      ...getGenericSearchQuery(searchQuery),
      as_administrator: searchQuery.asAdministrator || undefined,
    },
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const getThread = async (threadId: number): Promise<ThreadDetails> => {
  const { data } = await messagesThreadsRetrieve({
    path: { id: threadId },
    throwOnError: true,
  });
  return data;
};

const getThreadMessages = async (
  searchQuery: ThreadMessagesSearchQuery,
): Promise<ThreadMessagesSearchResult> => {
  const { data } = await messagesThreadsMessagesList({
    path: { id: searchQuery.threadId },
    query: getGenericSearchQuery(searchQuery),
    throwOnError: true,
  });
  return { ...data, searchQuery };
};

const send = async (payload: MessageSendPayload): Promise<ThreadDetails> => {
  const { data } = await messagesThreadsCreate({
    body: {
      receiver_id: payload.receiverId,
      text: payload.text,
      send_as_administrator: payload.sendAsAdministrator,
    },
    throwOnError: true,
  });
  return data;
};

const reply = async (threadId: number, text: string): Promise<Message> => {
  const { data } = await messagesThreadsReplyCreate({
    path: { id: threadId },
    body: { text },
    throwOnError: true,
  });
  return data;
};

const getQuota = async (): Promise<MessageQuota> => {
  const { data } = await messagesQuotaRetrieve({ throwOnError: true });
  return data;
};

const markUnread = async (threadId: number): Promise<void> => {
  await messagesThreadsMarkUnreadCreate({
    path: { id: threadId },
    throwOnError: true,
  });
};

const getSettings = async (): Promise<MessageSettings> => {
  const { data } = await messagesSettingsRetrieve({ throwOnError: true });
  return data;
};

const updateSettings = async (
  allowMessages: boolean,
  blockedUserIds: number[],
): Promise<MessageSettings> => {
  const { data } = await messagesSettingsUpdate({
    body: {
      allow_messages: allowMessages,
      blocked_user_ids: blockedUserIds,
    },
    throwOnError: true,
  });
  return data;
};

const setBlocked = async (userId: number, blocked: boolean): Promise<void> => {
  const settings = await getSettings();
  const blockedUserIds = settings.blocked_users
    .map((user) => user.id)
    .filter((id) => id !== userId);
  if (blocked) {
    blockedUserIds.push(userId);
  }
  await updateSettings(settings.allow_messages ?? true, blockedUserIds);
};

const MessageService = {
  searchThreads,
  getThread,
  getThreadMessages,
  send,
  reply,
  getQuota,
  markUnread,
  getSettings,
  updateSettings,
  setBlocked,
};

export type {
  Message,
  MessageQuota,
  MessageSettings,
  ThreadDetails,
  ThreadListing,
  ThreadMessagesSearchQuery,
  ThreadMessagesSearchResult,
  ThreadSearchQuery,
  ThreadSearchResult,
};
export { MessageService };
