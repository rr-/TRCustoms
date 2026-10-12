import {
  messagesList,
  messagesMarkUnreadCreate,
  messagesQuotaRetrieve,
  messagesSettingsRetrieve,
  messagesSettingsUpdate,
  messagesThreadsCreate,
  messagesThreadsReplyCreate,
  messagesThreadsRetrieve,
} from "src/client";
import type {
  Message,
  MessageListing,
  MessageQuota,
  MessageSettings,
  ThreadDetails,
} from "src/client";
import type { GenericSearchQuery, GenericSearchResult } from "src/types";
import { getGenericSearchQuery } from "src/utils/misc";

enum MessageBox {
  Inbox = "inbox",
  Outbox = "outbox",
}

interface MessageSearchQuery extends GenericSearchQuery {
  box: MessageBox;
  asAdministrator?: boolean | undefined;
}

interface MessageSearchResult
  extends GenericSearchResult<MessageSearchQuery, MessageListing> {}

interface ThreadStartPayload {
  receiverId: number;
  subject: string;
  text: string;
  sendAsAdministrator: boolean;
}

const searchMessages = async (
  searchQuery: MessageSearchQuery,
): Promise<MessageSearchResult> => {
  const { data } = await messagesList({
    query: {
      ...getGenericSearchQuery(searchQuery),
      box: searchQuery.box,
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

const startThread = async (
  payload: ThreadStartPayload,
): Promise<ThreadDetails> => {
  const { data } = await messagesThreadsCreate({
    body: {
      receiver_id: payload.receiverId,
      subject: payload.subject,
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

const markUnread = async (messageId: number): Promise<void> => {
  await messagesMarkUnreadCreate({
    path: { id: messageId },
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
  searchMessages,
  getThread,
  startThread,
  reply,
  getQuota,
  markUnread,
  getSettings,
  updateSettings,
  setBlocked,
};

export type {
  Message,
  MessageListing,
  MessageQuota,
  MessageSettings,
  MessageSearchQuery,
  MessageSearchResult,
  ThreadDetails,
};
export { MessageBox, MessageService };
